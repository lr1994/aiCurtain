const SCENE_STORAGE_KEY = 'curtain-render-scene-selection';
const RESULT_STORAGE_KEY = 'curtain-render-result-detail';

const memoryStorage = {
	values: {}
};

function getUniStorage() {
	if (typeof uni !== 'undefined' && uni) {
		return uni;
	}
	return null;
}

function normalizeString(value) {
	return typeof value === 'string' ? value.trim() : '';
}

function normalizeConfig(config = {}) {
	return {
		pleatMultiple: normalizeString(config.pleatMultiple) || '2.0',
		headStyle: normalizeString(config.headStyle) || 'simple',
		includeSheer: typeof config.includeSheer === 'boolean' ? config.includeSheer : true
	};
}

function normalizeSelection(scene = {}) {
	return {
		sceneTemplateId: normalizeString(scene.sceneTemplateId || scene._id),
		sceneTitle: normalizeString(scene.sceneTitle || scene.title),
		backgroundFileId: normalizeString(scene.backgroundFileId),
		backgroundImage: normalizeString(scene.backgroundImage || scene.backgroundUrl || scene.coverUrl),
		textureImage: normalizeString(scene.textureImage || scene.textureUrl),
		prompt: normalizeString(scene.prompt || scene.promptText),
		model: normalizeString(scene.model),
		defaultConfig: normalizeConfig(scene.defaultConfig || {})
	};
}

function normalizeRenderResult(payload = {}) {
	return {
		recordId: normalizeString(payload.recordId || payload._id),
		status: normalizeString(payload.status),
		prompt: normalizeString(payload.prompt || payload.promptText),
		model: normalizeString(payload.model),
		errorMessage: normalizeString(payload.errorMessage),
		backgroundUrl: normalizeString(payload.backgroundUrl),
		textureUrl: normalizeString(payload.textureUrl),
		resultUrl: normalizeString(payload.resultUrl),
		coverUrl: normalizeString(payload.coverUrl || payload.resultUrl || payload.backgroundUrl || payload.textureUrl),
		timeText: normalizeString(payload.timeText),
		createTime: Number(payload.createTime || 0)
	};
}

function writeStorage(key, value) {
	const storage = getUniStorage();
	if (storage && typeof storage.setStorageSync === 'function') {
		storage.setStorageSync(key, value);
		return;
	}
	memoryStorage.values[key] = value;
}

function readStorage(key) {
	const storage = getUniStorage();
	if (storage && typeof storage.getStorageSync === 'function') {
		return storage.getStorageSync(key);
	}
	return memoryStorage.values[key];
}

function removeStorage(key) {
	const storage = getUniStorage();
	if (storage && typeof storage.removeStorageSync === 'function') {
		storage.removeStorageSync(key);
		return;
	}
	delete memoryStorage.values[key];
}

export function saveSceneSelection(scene = {}) {
	const normalized = normalizeSelection(scene);
	writeStorage(SCENE_STORAGE_KEY, JSON.stringify(normalized));
	return normalized;
}

export function readSceneSelection() {
	const rawValue = readStorage(SCENE_STORAGE_KEY);
	if (!rawValue) {
		return {};
	}
	if (typeof rawValue === 'object') {
		return normalizeSelection(rawValue);
	}
	try {
		return normalizeSelection(JSON.parse(rawValue));
	} catch (error) {
		return {};
	}
}

export function clearSceneSelection() {
	removeStorage(SCENE_STORAGE_KEY);
}

export function buildRenderDraft(scene = {}) {
	const normalized = normalizeSelection(scene);
	return {
		sceneTemplateId: normalized.sceneTemplateId,
		sceneTitle: normalized.sceneTitle,
		backgroundFileId: normalized.backgroundFileId,
		backgroundImage: normalized.backgroundImage,
		textureImage: normalized.textureImage,
		prompt: normalized.prompt,
		model: normalized.model,
		config: normalizeConfig(normalized.defaultConfig)
	};
}

export function saveRenderResult(payload = {}) {
	const normalized = normalizeRenderResult(payload);
	writeStorage(RESULT_STORAGE_KEY, JSON.stringify(normalized));
	return normalized;
}

export function readRenderResult() {
	const rawValue = readStorage(RESULT_STORAGE_KEY);
	if (!rawValue) {
		return {};
	}
	if (typeof rawValue === 'object') {
		return normalizeRenderResult(rawValue);
	}
	try {
		return normalizeRenderResult(JSON.parse(rawValue));
	} catch (error) {
		return {};
	}
}

export function clearRenderResult() {
	removeStorage(RESULT_STORAGE_KEY);
}

export default {
	saveSceneSelection,
	readSceneSelection,
	clearSceneSelection,
	buildRenderDraft,
	saveRenderResult,
	readRenderResult,
	clearRenderResult
};
