const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');

const projectRoot = path.resolve(__dirname, '..');
const generateModulePath = path.join(projectRoot, 'uniCloud-aliyun', 'cloudfunctions', 'curtain-preview-generate', 'index.js');
const generateConfigModulePath = path.join(projectRoot, 'uniCloud-aliyun', 'cloudfunctions', 'curtain-preview-generate', 'config.js');
const deleteModulePath = path.join(projectRoot, 'uniCloud-aliyun', 'cloudfunctions', 'curtain-work-delete', 'index.js');

function loadCloudFunction(modulePath, { uniCloud, uniId, env = {} }) {
	const originalLoad = Module._load;
	const originalEnv = {};
	delete require.cache[modulePath];
	delete require.cache[generateConfigModulePath];
	global.uniCloud = uniCloud;
	Object.keys(env).forEach((key) => {
		originalEnv[key] = process.env[key];
		process.env[key] = env[key];
	});

	Module._load = function patchedLoad(request, parent, isMain) {
		if (request === 'uni-id') {
			return uniId;
		}
		return originalLoad.call(this, request, parent, isMain);
	};

	try {
		return require(modulePath);
	} finally {
		Module._load = originalLoad;
		Object.keys(env).forEach((key) => {
			if (typeof originalEnv[key] === 'undefined') {
				delete process.env[key];
			} else {
				process.env[key] = originalEnv[key];
			}
		});
	}
}

function createHarness(options = {}) {
	const sourceRecords = {
		bg: {
			_id: 'bg',
			uid: 'user-1',
			kind: 'background',
			cloudPath: 'curtain-preview/source/user-1/background-1.png',
			ext: 'png',
			used: false,
			expiresAt: Date.now() + 60 * 1000
		},
		tx: {
			_id: 'tx',
			uid: 'user-1',
			kind: 'texture',
			cloudPath: 'curtain-preview/source/user-1/texture-1.png',
			ext: 'png',
			used: false,
			expiresAt: Date.now() + 60 * 1000
		}
	};
	const records = (options.records || []).map((item) => ({ ...item }));
	const pointAccounts = (options.pointAccounts || [
		{
			_id: 'account-1',
			uid: 'user-1',
			balance: 10,
			totalRecharge: 10,
			totalConsume: 0,
			status: true
		}
	]).map((item) => ({ ...item }));
	const pointFlows = [];
	const recordUpdates = [];

	const recordCollection = {
		async add(data) {
			const record = {
				_id: `record-${records.length + 1}`,
				...data
			};
			records.push(record);
			return { id: record._id };
		},
		doc(id) {
			return {
				async update(data) {
					recordUpdates.push({ id, data });
					const target = records.find((item) => item._id === id);
					if (target) {
						Object.assign(target, data);
						return { updated: 1 };
					}
					return { updated: 0 };
				}
			};
		},
		where(filter = {}) {
			return {
				async remove() {
					const index = records.findIndex((item) => Object.keys(filter).every((key) => item[key] === filter[key]));
					if (index < 0) {
						return { deleted: 0 };
					}
					records.splice(index, 1);
					return { deleted: 1 };
				}
			};
		}
	};

	const sourceCollection = {
		where(filter) {
			return {
				async update(data) {
					const recordId = filter && filter._id;
					const target = sourceRecords[recordId];
					const gtValue = filter && filter.expiresAt && filter.expiresAt.$gt;
					const matches = !!target
						&& (typeof filter.used === 'undefined' || target.used === filter.used)
						&& (!gtValue || Number(target.expiresAt) > Number(gtValue));
					if (!matches) {
						return { updated: 0 };
					}
					Object.assign(target, data);
					return { updated: 1 };
				}
			};
		},
		doc(id) {
			return {
				async get() {
					const record = sourceRecords[id];
					return {
						data: record ? [{ ...record }] : []
					};
				}
			};
		}
	};

	const pointAccountCollection = {
		where(filter = {}) {
			return {
				async get() {
					return {
						data: pointAccounts.filter((item) => Object.keys(filter).every((key) => item[key] === filter[key])).map((item) => ({ ...item }))
					};
				}
			};
		},
		doc(id) {
			return {
				async update(data) {
					const target = pointAccounts.find((item) => item._id === id);
					if (!target) {
						return { updated: 0 };
					}
					Object.assign(target, data);
					return { updated: 1 };
				}
			};
		},
		async add(data) {
			const record = {
				_id: `account-${pointAccounts.length + 1}`,
				...data
			};
			pointAccounts.push(record);
			return { id: record._id };
		}
	};

	const pointFlowCollection = {
		async add(data) {
			pointFlows.push({
				_id: `flow-${pointFlows.length + 1}`,
				...data
			});
			return { id: `flow-${pointFlows.length}` };
		}
	};

	const uniCloud = {
		database() {
			return {
				command: {
					gt(value) {
						return { $gt: value };
					}
				},
				collection(name) {
					if (name === 'curtain_preview_record') {
						return recordCollection;
					}
					if (name === 'curtain_preview_source_file') {
						return sourceCollection;
					}
					if (name === 'curtain_point_account') {
						return pointAccountCollection;
					}
					if (name === 'curtain_point_flow') {
						return pointFlowCollection;
					}
					throw new Error(`unexpected collection: ${name}`);
				}
			};
		},
		async getTempFileURL({ fileList }) {
			return {
				fileList: fileList.map((fileId) => ({
					fileID: fileId,
					tempFileURL: `https://cdn.example.com/${encodeURIComponent(fileId)}`
				}))
			};
		},
		httpclient: {
			async request(url) {
				if (url === 'https://api.apiyi.com/v1/chat/completions') {
					if (typeof options.previewResponse === 'function') {
						return options.previewResponse();
					}
					return {
						status: 200,
						data: {
							choices: [
								{
									message: {
										content: [
											{
												dataUrl: 'data:image/png;base64,AAAA'
											}
										]
									}
								}
							]
						}
					};
				}
				return {
					status: 200,
					headers: {
						'content-type': 'image/png',
						'content-length': '4'
					},
					data: Buffer.from([1, 2, 3, 4])
				};
			}
		},
		async uploadFile() {
			return {
				fileID: 'cloud://space/curtain-preview/record-result.png'
			};
		}
	};

	const uniId = {
		async checkToken() {
			return {
				uid: 'user-1'
			};
		}
	};

	return {
		generate: loadCloudFunction(generateModulePath, {
			uniCloud,
			uniId,
			env: {
				CURTAIN_PREVIEW_API_KEY: 'test-api-key'
			}
		}),
		workDelete: loadCloudFunction(deleteModulePath, {
			uniCloud,
			uniId
		}),
		records,
		recordUpdates,
		pointAccounts,
		pointFlows
	};
}

test('render success writes consume flow and decrements point balance once', async () => {
	const harness = createHarness();

	const result = await harness.generate.main({
		uniIdToken: 'token',
		backgroundFileId: 'cloud://space/curtain-preview/source/user-1/background-1.png',
		textureFileId: 'cloud://space/curtain-preview/source/user-1/texture-1.png',
		backgroundSourceId: 'bg',
		textureSourceId: 'tx',
		prompt: '将材质自然应用到窗帘区域'
	});

	assert.equal(result.success, true);
	assert.equal(harness.pointAccounts[0].balance, 9);
	assert.equal(harness.pointAccounts[0].totalConsume, 1);
	assert.equal(harness.pointFlows.length, 1);
	assert.equal(harness.pointFlows[0].type, 'consume');
	assert.equal(harness.pointFlows[0].bizType, 'render');
});

test('render failure does not decrement points', async () => {
	const harness = createHarness({
		previewResponse() {
			return {
				status: 500,
				data: {
					message: 'provider error'
				}
			};
		}
	});

	const result = await harness.generate.main({
		uniIdToken: 'token',
		backgroundFileId: 'cloud://space/curtain-preview/source/user-1/background-1.png',
		textureFileId: 'cloud://space/curtain-preview/source/user-1/texture-1.png',
		backgroundSourceId: 'bg',
		textureSourceId: 'tx',
		prompt: '将材质自然应用到窗帘区域'
	});

	assert.equal(result.success, false);
	assert.equal(harness.pointAccounts[0].balance, 10);
	assert.equal(harness.pointFlows.length, 0);
});

test('work delete removes only current user record', async () => {
	const harness = createHarness({
		records: [
			{ _id: 'record-1', uid: 'user-1', status: 'success' },
			{ _id: 'record-2', uid: 'user-2', status: 'success' }
		]
	});

	const result = await harness.workDelete.main({
		uniIdToken: 'token',
		recordId: 'record-1'
	});

	assert.equal(result.success, true);
	assert.deepEqual(harness.records.map((item) => item._id), ['record-2']);
});
