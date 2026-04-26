const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');

const projectRoot = path.resolve(__dirname, '..');
const sceneModulePath = path.join(projectRoot, 'uniCloud-aliyun', 'cloudfunctions', 'curtain-scene-list', 'index.js');
const sceneTicketModulePath = path.join(projectRoot, 'uniCloud-aliyun', 'cloudfunctions', 'curtain-scene-create-source-ticket', 'index.js');
const packageModulePath = path.join(projectRoot, 'uniCloud-aliyun', 'cloudfunctions', 'curtain-point-package-list', 'index.js');

function loadCloudFunction(modulePath, { uniCloud, uniId = null }) {
	delete require.cache[modulePath];
	global.uniCloud = uniCloud;
	const originalLoad = Module._load;

	Module._load = function patchedLoad(request, parent, isMain) {
		if (request === 'uni-id' && uniId) {
			return uniId;
		}
		return originalLoad.call(this, request, parent, isMain);
	};

	try {
		return require(modulePath);
	} finally {
		Module._load = originalLoad;
	}
}

function createQueryChain(list = []) {
	return {
		where(filter = {}) {
			const filtered = list.filter((item) => {
				return Object.keys(filter).every((key) => {
					return item[key] === filter[key];
				});
			});
			return createQueryChain(filtered);
		},
		orderBy(field, direction) {
			const factor = direction === 'desc' ? -1 : 1;
			const sorted = list.slice().sort((left, right) => {
				const leftValue = Number(left[field] || 0);
				const rightValue = Number(right[field] || 0);
				return (leftValue - rightValue) * factor;
			});
			return createQueryChain(sorted);
		},
		async get() {
			return {
				data: list.map((item) => ({ ...item }))
			};
		}
	};
}

function createUniCloudMock({ scenes = [], packages = [] } = {}) {
	const sourceRecords = [];

	return {
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
					if (name === 'curtain_scene_template') {
						const chain = createQueryChain(scenes);
						return Object.assign({}, chain, {
							doc(id) {
								return {
									async get() {
										const record = scenes.find((item) => item._id === id);
										return {
											data: record ? [Object.assign({}, record)] : []
										};
									}
								};
							}
						});
					}
					if (name === 'curtain_point_package') {
						return createQueryChain(packages);
					}
					if (name === 'curtain_preview_source_file') {
						return {
							async add(data) {
								const record = Object.assign({
									_id: `source-${sourceRecords.length + 1}`
								}, data);
								sourceRecords.push(record);
								return {
									id: record._id
								};
							}
						};
					}
					throw new Error(`unexpected collection: ${name}`);
				}
			};
		},
		sourceRecords
	};
}

test('scene list falls back to local defaults when database is empty', async () => {
	const cloudFunction = loadCloudFunction(sceneModulePath, {
		uniCloud: createUniCloudMock()
	});

	const result = await cloudFunction.main({
		categoryKey: 'all'
	});

	assert.equal(result.success, true);
	assert.equal(result.source, 'default');
	assert.equal(result.list.length > 0, true);
	assert.equal(result.list[0].title, '法式客厅 30㎡');
});

test('scene list returns normalized cloud scenes for the selected category', async () => {
	const cloudFunction = loadCloudFunction(sceneModulePath, {
		uniCloud: createUniCloudMock({
		scenes: [
			{
				_id: 'scene-b',
				categoryKey: 'bedroom',
				categoryName: '卧室',
				title: '奶油卧室 16㎡',
				coverUrl: 'cloud://scene-b.jpg',
				backgroundImage: 'cloud://scene-b-preview.jpg',
				backgroundFileId: 'cloud://space/showroom/scene-b.jpg',
				defaultConfig: {
					pleatMultiple: '1.8',
					headStyle: 'wave',
					includeSheer: true
				},
				sort: 20,
				status: true
			},
			{
				_id: 'scene-x',
				categoryKey: 'living-room',
				categoryName: '客厅',
				title: '客厅 28㎡',
				coverUrl: 'cloud://scene-x.jpg',
				backgroundImage: 'cloud://scene-x-preview.jpg',
				backgroundFileId: 'cloud://space/showroom/scene-x.jpg',
				defaultConfig: {
					pleatMultiple: '2.0',
					headStyle: 'simple',
					includeSheer: true
				},
				sort: 10,
				status: true
			}
		]
		})
	});

	const result = await cloudFunction.main({
		categoryKey: 'bedroom'
	});

	assert.equal(result.success, true);
	assert.equal(result.source, 'cloud');
	assert.equal(result.list.length, 1);
	assert.equal(result.list[0]._id, 'scene-b');
	assert.equal(result.list[0].categoryName, '卧室');
	assert.equal(result.list[0].backgroundFileId, 'cloud://space/showroom/scene-b.jpg');
});

test('scene source ticket creates trusted background source for configured cloud scene', async () => {
	const uniCloud = createUniCloudMock({
		scenes: [
			{
				_id: 'scene-b',
				categoryKey: 'bedroom',
				categoryName: '卧室',
				title: '奶油卧室 16㎡',
				backgroundImage: 'cloud://scene-b-preview.jpg',
				backgroundFileId: 'cloud://space/showroom/scene-b.jpg',
				sort: 20,
				status: true
			}
		]
	});
	const cloudFunction = loadCloudFunction(sceneTicketModulePath, {
		uniCloud,
		uniId: {
			async checkToken() {
				return {
					uid: 'user-1'
				};
			}
		}
	});

	const result = await cloudFunction.main({
		uniIdToken: 'token',
		sceneTemplateId: 'scene-b'
	});

	assert.equal(result.success, true);
	assert.equal(result.backgroundFileId, 'cloud://space/showroom/scene-b.jpg');
	assert.equal(result.sourceId, 'source-1');
	assert.equal(uniCloud.sourceRecords.length, 1);
	assert.equal(uniCloud.sourceRecords[0].cloudPath, 'showroom/scene-b.jpg');
	assert.equal(uniCloud.sourceRecords[0].kind, 'background');
});

test('package list returns sorted active packages', async () => {
	const cloudFunction = loadCloudFunction(packageModulePath, {
		uniCloud: createUniCloudMock({
		packages: [
			{
				_id: 'pkg-store',
				title: '门店包',
				priceFen: 9990,
				points: 120,
				bonusPoints: 20,
				sort: 30,
				status: true
			},
			{
				_id: 'pkg-disabled',
				title: '停用包',
				priceFen: 1,
				points: 1,
				bonusPoints: 0,
				sort: 5,
				status: false
			},
			{
				_id: 'pkg-trial',
				title: '体验包',
				priceFen: 990,
				points: 10,
				bonusPoints: 0,
				sort: 10,
				status: true
			},
			{
				_id: 'pkg-growth',
				title: '进阶包',
				priceFen: 2990,
				points: 35,
				bonusPoints: 5,
				sort: 20,
				status: true
			}
		]
		})
	});

	const result = await cloudFunction.main({});

	assert.equal(result.success, true);
	assert.deepEqual(result.list.map((item) => item.title), ['体验包', '进阶包', '门店包']);
});
