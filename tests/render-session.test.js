const test = require('node:test');
const assert = require('node:assert/strict');

const {
	saveSceneSelection,
	readSceneSelection,
	clearSceneSelection,
	buildRenderDraft,
	saveRenderResult,
	readRenderResult,
	clearRenderResult
} = require('../common/curtain-app/render-session');

test('buildRenderDraft merges scene defaults with render form defaults', () => {
	const draft = buildRenderDraft({
		sceneTemplateId: 'scene-1',
		sceneTitle: '法式客厅 30㎡',
		backgroundImage: 'cloud://space/scene-1.jpg',
		defaultConfig: {
			pleatMultiple: '2.0',
			headStyle: 'simple',
			includeSheer: true
		}
	});

	assert.equal(draft.sceneTemplateId, 'scene-1');
	assert.equal(draft.sceneTitle, '法式客厅 30㎡');
	assert.equal(draft.backgroundImage, 'cloud://space/scene-1.jpg');
	assert.equal(draft.config.pleatMultiple, '2.0');
	assert.equal(draft.config.headStyle, 'simple');
	assert.equal(draft.config.includeSheer, true);
});

test('saveSceneSelection persists the latest showroom selection', () => {
	clearSceneSelection();
	saveSceneSelection({
		sceneTemplateId: 'scene-2',
		sceneTitle: '奶油风卧室',
		backgroundImage: 'cloud://space/scene-2.jpg',
		textureImage: 'cloud://space/texture-2.jpg',
		prompt: '柔和奶油风窗帘',
		model: 'gemini-3.1-flash-image-preview'
	});

	const saved = readSceneSelection();

	assert.equal(saved.sceneTemplateId, 'scene-2');
	assert.equal(saved.sceneTitle, '奶油风卧室');
	assert.equal(saved.backgroundImage, 'cloud://space/scene-2.jpg');
	assert.equal(saved.textureImage, 'cloud://space/texture-2.jpg');
	assert.equal(saved.prompt, '柔和奶油风窗帘');
	assert.equal(saved.model, 'gemini-3.1-flash-image-preview');
});

test('saveSceneSelection keeps reuse payload even when sceneTemplateId is empty', () => {
	clearSceneSelection();
	saveSceneSelection({
		sceneTemplateId: '',
		sceneTitle: '来自我的作品',
		backgroundImage: 'https://cdn.example.com/background.png',
		textureImage: 'https://cdn.example.com/texture.png',
		prompt: '保留褶皱方向并增强真实感'
	});

	const saved = readSceneSelection();
	const draft = buildRenderDraft(saved);

	assert.equal(saved.sceneTemplateId, '');
	assert.equal(saved.backgroundImage, 'https://cdn.example.com/background.png');
	assert.equal(saved.textureImage, 'https://cdn.example.com/texture.png');
	assert.equal(saved.prompt, '保留褶皱方向并增强真实感');
	assert.equal(draft.backgroundImage, 'https://cdn.example.com/background.png');
	assert.equal(draft.textureImage, 'https://cdn.example.com/texture.png');
	assert.equal(draft.prompt, '保留褶皱方向并增强真实感');
});

test('clearSceneSelection removes previously saved showroom selection', () => {
	saveSceneSelection({
		sceneTemplateId: 'scene-3',
		sceneTitle: '现代客餐厅'
	});

	clearSceneSelection();

	assert.deepEqual(readSceneSelection(), {});
});

test('saveRenderResult persists the latest render detail payload', () => {
	clearRenderResult();
	saveRenderResult({
		recordId: 'record-1',
		status: 'success',
		resultUrl: 'https://cdn.example.com/result.png',
		backgroundUrl: 'https://cdn.example.com/background.png',
		textureUrl: 'https://cdn.example.com/texture.png',
		prompt: '自然融合窗帘材质'
	});

	const saved = readRenderResult();

	assert.equal(saved.recordId, 'record-1');
	assert.equal(saved.status, 'success');
	assert.equal(saved.resultUrl, 'https://cdn.example.com/result.png');
	assert.equal(saved.backgroundUrl, 'https://cdn.example.com/background.png');
	assert.equal(saved.textureUrl, 'https://cdn.example.com/texture.png');
	assert.equal(saved.prompt, '自然融合窗帘材质');
});

test('clearRenderResult removes saved render detail payload', () => {
	saveRenderResult({
		recordId: 'record-2',
		resultUrl: 'https://cdn.example.com/result-2.png'
	});

	clearRenderResult();

	assert.deepEqual(readRenderResult(), {});
});
