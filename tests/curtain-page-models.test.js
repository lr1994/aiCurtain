const test = require('node:test');
const assert = require('node:assert/strict');

const {
	normalizeWorkRecord,
	createWorkStatusTabs,
	filterWorksByStatus,
	createShowroomCategories,
	buildRenderHomeViewModel
} = require('../common/curtain-app/page-models');

test('normalizeWorkRecord prefers result image and formats status metadata', () => {
	const result = normalizeWorkRecord({
		_id: 'record-1',
		resultUrl: 'https://cdn.example.com/result.jpg',
		backgroundUrl: 'https://cdn.example.com/background.jpg',
		textureUrl: 'https://cdn.example.com/texture.jpg',
		status: 'success',
		prompt: '奶油风窗帘',
		errorMessage: '',
		createTime: 1714100000000
	});

	assert.equal(result._id, 'record-1');
	assert.equal(result.coverUrl, 'https://cdn.example.com/result.jpg');
	assert.equal(result.statusLabel, '已完成');
	assert.equal(result.statusTone, 'success');
	assert.equal(result.promptText, '奶油风窗帘');
	assert.equal(result.timeText.length > 0, true);
});

test('createWorkStatusTabs returns counts for all built-in statuses', () => {
	const list = [
		normalizeWorkRecord({ _id: '1', status: 'processing' }),
		normalizeWorkRecord({ _id: '2', status: 'success' }),
		normalizeWorkRecord({ _id: '3', status: 'success' }),
		normalizeWorkRecord({ _id: '4', status: 'fail' })
	];

	const tabs = createWorkStatusTabs(list);

	assert.deepEqual(
		tabs.map((item) => ({ key: item.key, count: item.count })),
		[
			{ key: 'all', count: 4 },
			{ key: 'processing', count: 1 },
			{ key: 'success', count: 2 },
			{ key: 'fail', count: 1 }
		]
	);
});

test('filterWorksByStatus keeps all records for all and filters single status otherwise', () => {
	const list = [
		normalizeWorkRecord({ _id: '1', status: 'processing' }),
		normalizeWorkRecord({ _id: '2', status: 'success' }),
		normalizeWorkRecord({ _id: '3', status: 'fail' })
	];

	assert.equal(filterWorksByStatus(list, 'all').length, 3);
	assert.deepEqual(filterWorksByStatus(list, 'success').map((item) => item._id), ['2']);
});

test('createShowroomCategories prepends all and de-duplicates category keys', () => {
	const categories = createShowroomCategories([
		{ categoryKey: 'living-room', categoryName: '客厅' },
		{ categoryKey: 'bedroom', categoryName: '卧室' },
		{ categoryKey: 'living-room', categoryName: '客厅' }
	]);

	assert.deepEqual(categories, [
		{ key: 'all', label: '全部' },
		{ key: 'living-room', label: '客厅' },
		{ key: 'bedroom', label: '卧室' }
	]);
});

test('buildRenderHomeViewModel returns render home labels for ready and generating states', () => {
	const readyState = buildRenderHomeViewModel({
		hasLogin: true,
		balance: 88,
		generating: false,
		canGenerate: true
	});
	const generatingState = buildRenderHomeViewModel({
		hasLogin: true,
		balance: 88,
		generating: true,
		canGenerate: false
	});

	assert.equal(readyState.brandText, '帝想AI');
	assert.equal(readyState.greetingText, '你好，盛泰窗帘厂');
	assert.equal(readyState.pointsText, '当前可用点数：88 点');
	assert.equal(readyState.submitText, '立即生成（消耗 1 点）');
	assert.equal(readyState.submitDisabled, false);
	assert.equal(generatingState.submitText, '生成中...');
	assert.equal(generatingState.submitDisabled, true);
});

test('buildRenderHomeViewModel surfaces point summary load errors for logged-in users', () => {
	const errorState = buildRenderHomeViewModel({
		hasLogin: true,
		balance: 0,
		generating: false,
		canGenerate: false,
		pointSummaryError: '请重新登录后刷新'
	});

	assert.equal(errorState.pointsText, '当前可用点数：--');
	assert.equal(errorState.loginHintText, '点数同步失败：请重新登录后刷新');
	assert.equal(errorState.submitDisabled, true);
});

test('buildRenderHomeViewModel keeps points in pending state while point summary is loading', () => {
	const loadingState = buildRenderHomeViewModel({
		hasLogin: true,
		balance: 0,
		generating: false,
		canGenerate: true,
		pointSummaryLoading: true
	});

	assert.equal(loadingState.pointsText, '当前可用点数：--');
	assert.equal(loadingState.loginHintText, '点数同步中...');
	assert.equal(loadingState.submitDisabled, false);
});
