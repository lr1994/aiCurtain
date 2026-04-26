'use strict';

const defaultScenes = require('../../../common/curtain-app/default-scenes');

const db = uniCloud.database();
const collection = db.collection('curtain_scene_template');

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

function normalizeFileId(value) {
	const normalizedValue = normalizeString(value);

	if (/^cloud:\/\//i.test(normalizedValue) || /^https?:\/\//i.test(normalizedValue)) {
		return normalizedValue;
	}

	return '';
}

function normalizeScene(item = {}) {
	const backgroundFileId = normalizeFileId(item.backgroundFileId || item.backgroundImage);
	const coverFileId = normalizeFileId(item.coverFileId || item.coverUrl);

	return {
		_id: normalizeString(item._id),
		categoryKey: normalizeString(item.categoryKey),
		categoryName: normalizeString(item.categoryName),
		title: normalizeString(item.title),
		coverFileId,
		backgroundFileId,
		coverUrl: normalizeString(item.coverUrl || item.coverFileId || item.backgroundFileId),
		backgroundImage: normalizeString(item.backgroundImage || item.backgroundFileId || item.coverUrl || item.coverFileId),
		tags: Array.isArray(item.tags) ? item.tags.filter(Boolean) : [],
		defaultConfig: normalizeConfig(item.defaultConfig || {}),
		canDirectGenerate: !!backgroundFileId
	};
}

function getDefaultScenes(categoryKey) {
	if (categoryKey === 'all') {
		return defaultScenes.map((item) => normalizeScene(item));
	}
	return defaultScenes
		.filter((item) => item.categoryKey === categoryKey)
		.map((item) => normalizeScene(item));
}

function buildSceneFilter(categoryKey) {
	if (categoryKey === 'all') {
		return {
			status: true
		};
	}
	return {
		status: true,
		categoryKey
	};
}

exports.main = async (event) => {
	const categoryKey = normalizeString(event && event.categoryKey) || 'all';
	const dbList = await collection
		.where(buildSceneFilter(categoryKey))
		.orderBy('sort', 'asc')
		.get();
	const normalizedList = Array.isArray(dbList.data) ? dbList.data.map((item) => normalizeScene(item)) : [];
	const finalList = normalizedList.length > 0 ? normalizedList : getDefaultScenes(categoryKey);

	return {
		success: true,
		list: finalList,
		source: normalizedList.length > 0 ? 'cloud' : 'default'
	};
};
