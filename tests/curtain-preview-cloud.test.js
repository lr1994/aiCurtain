const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');

const worktreeRoot = path.resolve(__dirname, '..');
const generateModulePath = path.join(worktreeRoot, 'uniCloud-aliyun', 'cloudfunctions', 'curtain-preview-generate', 'index.js');
const historyModulePath = path.join(worktreeRoot, 'uniCloud-aliyun', 'cloudfunctions', 'curtain-preview-history', 'index.js');
const generateConfigModulePath = path.join(worktreeRoot, 'uniCloud-aliyun', 'cloudfunctions', 'curtain-preview-generate', 'config.js');

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

function createGenerateHarness(options = {}) {
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
	const records = [];
	const recordUpdates = [];
	const sourceUpdates = [];
	const uploadedFiles = [];
	const pointAccounts = [
		{
			_id: 'account-1',
			uid: 'user-1',
			balance: 10,
			totalRecharge: 10,
			totalConsume: 0,
			status: true
		}
	];
	const pointFlows = [];
	const tempUrlMap = Object.assign({
		'cloud://space/curtain-preview/source/user-1/background-1.png': 'https://cdn.example.com/background.png',
		'cloud://space/curtain-preview/source/user-1/texture-1.png': 'https://cdn.example.com/texture.png',
		'cloud://space/curtain-preview/record-1-1.png': 'https://cdn.example.com/result.png'
	}, options.tempUrlMap || {});

	if (options.sourceRecords) {
		Object.keys(options.sourceRecords).forEach((key) => {
			sourceRecords[key] = Object.assign({}, sourceRecords[key], options.sourceRecords[key]);
		});
	}

	const recordCollection = {
		async add(data) {
			records.push(Object.assign({ _id: 'record-1' }, data));
			return { id: 'record-1' };
		},
		doc(id) {
			return {
				async update(data) {
					recordUpdates.push({ id, data });
					const target = records.find((item) => item._id === id);
					if (target) {
						Object.assign(target, data);
					}
					return { updated: 1 };
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
					const matchesUsed = typeof filter.used === 'undefined' || !!target && target.used === filter.used;
					const expiresAtFilter = filter && filter.expiresAt;
					const gtValue = expiresAtFilter && expiresAtFilter.$gt;
					const matchesExpiresAt = !gtValue || !!target && Number(target.expiresAt) > Number(gtValue);

					if (!target || !matchesUsed || !matchesExpiresAt) {
						return { updated: 0 };
					}

					sourceUpdates.push({ id: recordId, data });
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
						data: record ? [Object.assign({}, record)] : []
					};
				},
				async update(data) {
					sourceUpdates.push({ id, data });
					if (sourceRecords[id]) {
						Object.assign(sourceRecords[id], data);
					}
					return { updated: sourceRecords[id] ? 1 : 0 };
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
			const record = Object.assign({ _id: `account-${pointAccounts.length + 1}` }, data);
			pointAccounts.push(record);
			return { id: record._id };
		}
	};

	const pointFlowCollection = {
		async add(data) {
			pointFlows.push(Object.assign({ _id: `flow-${pointFlows.length + 1}` }, data));
			return { id: `flow-${pointFlows.length}` };
		}
	};

	const uniCloud = {
		database() {
			return {
				command: {
					gt(value) {
						return {
							$gt: value
						};
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
					tempFileURL: tempUrlMap[fileId] || ''
				}))
			};
		},
		httpclient: {
			async request(url, config = {}) {
				if (url === 'https://api.apiyi.com/v1/chat/completions') {
					if (typeof options.previewResponse === 'function') {
						return options.previewResponse(url, config);
					}
					return {
						status: 200,
						data: {
							choices: [
								{
									message: {
										content: [
											{
												type: 'image_url',
												image_url: {
													url: 'https://cdn.example.com/generated.png'
												}
											}
										]
									}
								}
							]
						}
					};
				}
				if (typeof options.downloadResponse === 'function') {
					return options.downloadResponse(url, config);
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
		async uploadFile({ cloudPath, fileContent }) {
			uploadedFiles.push({ cloudPath, fileContent });
			return {
				fileID: 'cloud://space/curtain-preview/record-1-1.png'
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

	const cloudFunction = loadCloudFunction(generateModulePath, {
		uniCloud,
		uniId,
		env: Object.assign({
			CURTAIN_PREVIEW_API_KEY: 'test-api-key'
		}, options.env || {})
	});

	return {
		cloudFunction,
		uniCloud,
		records,
		recordUpdates,
		sourceRecords,
		sourceUpdates,
		uploadedFiles,
		pointAccounts,
		pointFlows
	};
}

function createHistoryHarness(options = {}) {
	const list = (options.list || []).map((item) => Object.assign({}, item));
	const queryChain = {
		field() {
			return this;
		},
		orderBy() {
			return this;
		},
		skip() {
			return this;
		},
		limit() {
			return this;
		},
		async get() {
			return { data: list };
		},
		async count() {
			return { total: list.length };
		}
	};
	const uniCloud = {
		database() {
			return {
				collection(name) {
					assert.equal(name, 'curtain_preview_record');
					return {
						where() {
							return queryChain;
						}
					};
				}
			};
		},
		async getTempFileURL({ fileList }) {
			return {
				fileList: fileList.map((fileId) => ({
					fileID: fileId,
					tempFileURL: `https://fresh.example.com/${encodeURIComponent(fileId)}`
				}))
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
		cloudFunction: loadCloudFunction(historyModulePath, { uniCloud, uniId }),
		uniCloud
	};
}

test('generate rejects private IPv6 result URLs', { concurrency: false }, async () => {
	const harness = createGenerateHarness({
		previewResponse() {
			return {
				status: 200,
				data: {
					choices: [
						{
							message: {
								content: [
									{
										type: 'image_url',
										image_url: {
											url: 'https://[fd00::1]/generated.png'
										}
									}
								]
							}
						}
					]
				}
			};
		}
	});

	const response = await harness.cloudFunction.main({
		uniIdToken: 'token',
		backgroundFileId: 'cloud://space/curtain-preview/source/user-1/background-1.png',
		textureFileId: 'cloud://space/curtain-preview/source/user-1/texture-1.png',
		backgroundSourceId: 'bg',
		textureSourceId: 'tx',
		prompt: '将材质自然应用到窗帘区域'
	});

	assert.equal(response.success, false);
	assert.equal(response.errCode, 'UNSAFE_RESULT_IMAGE_URL');
});

test('generate rejects source tickets that are already used or expired', { concurrency: false }, async () => {
	const harness = createGenerateHarness({
		sourceRecords: {
			bg: {
				used: true,
				expiresAt: Date.now() - 1000
			}
		},
		previewResponse() {
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
	});

	const response = await harness.cloudFunction.main({
		uniIdToken: 'token',
		backgroundFileId: 'cloud://space/curtain-preview/source/user-1/background-1.png',
		textureFileId: 'cloud://space/curtain-preview/source/user-1/texture-1.png',
		backgroundSourceId: 'bg',
		textureSourceId: 'tx',
		prompt: '将材质自然应用到窗帘区域'
	});

	assert.equal(response.success, false);
	assert.match(response.message, /已被使用|已过期/);
});

test('generate consumes both source tickets after a successful run', { concurrency: false }, async () => {
	const harness = createGenerateHarness({
		previewResponse() {
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
	});

	const response = await harness.cloudFunction.main({
		uniIdToken: 'token',
		backgroundFileId: 'cloud://space/curtain-preview/source/user-1/background-1.png',
		textureFileId: 'cloud://space/curtain-preview/source/user-1/texture-1.png',
		backgroundSourceId: 'bg',
		textureSourceId: 'tx',
		prompt: '将材质自然应用到窗帘区域'
	});

	assert.equal(response.success, true);
	assert.equal(harness.sourceRecords.bg.used, true);
	assert.equal(harness.sourceRecords.tx.used, true);
});

test('generate accepts local debug url style source file ids', { concurrency: false }, async () => {
	const harness = createGenerateHarness({
		tempUrlMap: {
			'http://127.0.0.1:7000/storage?fileID=cloud%3A%2F%2Fspace%2Fcurtain-preview%2Fsource%2Fuser-1%2Fbackground-1.png': 'https://cdn.example.com/background.png',
			'http://127.0.0.1:7000/storage?fileID=cloud%3A%2F%2Fspace%2Fcurtain-preview%2Fsource%2Fuser-1%2Ftexture-1.png': 'https://cdn.example.com/texture.png'
		},
		previewResponse() {
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
	});

	const response = await harness.cloudFunction.main({
		uniIdToken: 'token',
		backgroundFileId: 'http://127.0.0.1:7000/storage?fileID=cloud%3A%2F%2Fspace%2Fcurtain-preview%2Fsource%2Fuser-1%2Fbackground-1.png',
		textureFileId: 'http://127.0.0.1:7000/storage?fileID=cloud%3A%2F%2Fspace%2Fcurtain-preview%2Fsource%2Fuser-1%2Ftexture-1.png',
		backgroundSourceId: 'bg',
		textureSourceId: 'tx',
		prompt: '将材质自然应用到窗帘区域'
	});

	assert.equal(response.success, true);
});

test('generate accepts bspapp cdn source file urls', { concurrency: false }, async () => {
	const harness = createGenerateHarness({
		tempUrlMap: {
			'https://mp-9473748b-e2e0-4984-9e06-1bf18906fbd8.cdn.bspapp.com/cloudstorage/73e5c5f0-c862-44ab-901e-bababa7dfb93.jpg': 'https://mp-9473748b-e2e0-4984-9e06-1bf18906fbd8.cdn.bspapp.com/cloudstorage/73e5c5f0-c862-44ab-901e-bababa7dfb93.jpg',
			'https://mp-9473748b-e2e0-4984-9e06-1bf18906fbd8.cdn.bspapp.com/cloudstorage/5c0aa578-d96e-4122-8ac1-8ec49af9c178.jpg': 'https://mp-9473748b-e2e0-4984-9e06-1bf18906fbd8.cdn.bspapp.com/cloudstorage/5c0aa578-d96e-4122-8ac1-8ec49af9c178.jpg'
		},
		previewResponse() {
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
	});

	const response = await harness.cloudFunction.main({
		uniIdToken: 'token',
		backgroundFileId: 'https://mp-9473748b-e2e0-4984-9e06-1bf18906fbd8.cdn.bspapp.com/cloudstorage/73e5c5f0-c862-44ab-901e-bababa7dfb93.jpg',
		textureFileId: 'https://mp-9473748b-e2e0-4984-9e06-1bf18906fbd8.cdn.bspapp.com/cloudstorage/5c0aa578-d96e-4122-8ac1-8ec49af9c178.jpg',
		backgroundSourceId: 'bg',
		textureSourceId: 'tx',
		prompt: '将材质自然应用到窗帘区域'
	});

	assert.equal(response.success, true);
});

test('generate requires api key from runtime env instead of local plaintext config', { concurrency: false }, async () => {
	const harness = createGenerateHarness({
		env: {
			CURTAIN_PREVIEW_API_KEY: ''
		}
	});

	const response = await harness.cloudFunction.main({
		uniIdToken: 'token',
		backgroundFileId: 'cloud://space/curtain-preview/source/user-1/background-1.png',
		textureFileId: 'cloud://space/curtain-preview/source/user-1/texture-1.png',
		backgroundSourceId: 'bg',
		textureSourceId: 'tx',
		prompt: '将材质自然应用到窗帘区域'
	});

	assert.equal(response.success, false);
	assert.equal(response.errCode, 'API_KEY_NOT_CONFIGURED');
});

test('history refreshes temp URLs instead of returning stale stored links', { concurrency: false }, async () => {
	const harness = createHistoryHarness({
		list: [
			{
				_id: 'record-1',
				backgroundFileId: 'cloud://space/background.png',
				backgroundUrl: 'https://stale.example.com/background.png',
				textureFileId: 'cloud://space/texture.png',
				textureUrl: 'https://stale.example.com/texture.png',
				resultFileId: 'cloud://space/result.png',
				resultUrl: 'https://stale.example.com/result.png',
				prompt: 'prompt',
				model: 'gemini-3.1-flash-image-preview',
				status: 'success'
			}
		]
	});

	const response = await harness.cloudFunction.main({
		uniIdToken: 'token',
		pageNo: 1,
		pageSize: 10
	});

	assert.equal(response.success, true);
	assert.equal(response.list[0].backgroundUrl, 'https://fresh.example.com/cloud%3A%2F%2Fspace%2Fbackground.png');
	assert.equal(response.list[0].textureUrl, 'https://fresh.example.com/cloud%3A%2F%2Fspace%2Ftexture.png');
	assert.equal(response.list[0].resultUrl, 'https://fresh.example.com/cloud%3A%2F%2Fspace%2Fresult.png');
});
