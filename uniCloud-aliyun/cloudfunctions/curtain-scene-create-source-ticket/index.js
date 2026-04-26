'use strict';

const uniID = require('uni-id');
const defaultScenes = require('../../../common/curtain-app/default-scenes');

const db = uniCloud.database();
const collection = db.collection('curtain_scene_template');
const sourceCollection = db.collection('curtain_preview_source_file');
const TICKET_EXPIRES_IN_MS = 10 * 60 * 1000;

function normalizeString(value) {
	return typeof value === 'string' ? value.trim() : '';
}

function buildFailResponse(message) {
	return {
		success: false,
		message
	};
}

async function getCurrentUser(event) {
	if (!event || !event.uniIdToken) {
		throw new Error('请先登录后再选择样板间生成');
	}
	try {
		const payload = await uniID.checkToken(event.uniIdToken);
		if (payload.code && payload.code > 0) {
			throw new Error('登录状态已失效，请重新登录');
		}
		return payload;
	} catch (error) {
		if (error && error.message) {
			throw error;
		}
		throw new Error('登录状态已失效，请重新登录');
	}
}

function findDefaultScene(sceneTemplateId) {
	return defaultScenes.find((item) => normalizeString(item._id) === sceneTemplateId) || null;
}

async function findCloudScene(sceneTemplateId) {
	const result = await collection.doc(sceneTemplateId).get();

	if (!Array.isArray(result.data) || result.data.length === 0) {
		return null;
	}

	const scene = result.data[0] || {};

	if (scene.status === false) {
		return null;
	}

	return scene;
}

function extractCloudPath(fileId) {
	const normalizedFileId = normalizeString(fileId);
	const match = /^cloud:\/\/[^/]+\/(.+)$/.exec(normalizedFileId);

	if (!match || !match[1]) {
		return '';
	}

	return normalizeString(match[1]);
}

function resolveSceneBackgroundFileId(scene = {}) {
	const candidates = [
		scene.backgroundFileId,
		scene.backgroundImage
	];

	for (let index = 0; index < candidates.length; index += 1) {
		const candidate = normalizeString(candidates[index]);
		if (/^cloud:\/\//i.test(candidate)) {
			return candidate;
		}
	}

	return '';
}

async function resolveScene(sceneTemplateId) {
	const normalizedSceneTemplateId = normalizeString(sceneTemplateId);

	if (!normalizedSceneTemplateId) {
		throw new Error('sceneTemplateId不能为空');
	}

	const cloudScene = await findCloudScene(normalizedSceneTemplateId);

	if (cloudScene) {
		return cloudScene;
	}

	const defaultScene = findDefaultScene(normalizedSceneTemplateId);

	if (defaultScene) {
		return defaultScene;
	}

	throw new Error('未找到对应的样板间');
}

exports.main = async (event) => {
	try {
		const auth = await getCurrentUser(event || {});
		const sceneTemplateId = normalizeString(event && event.sceneTemplateId);
		const scene = await resolveScene(sceneTemplateId);
		const backgroundFileId = resolveSceneBackgroundFileId(scene);
		const cloudPath = extractCloudPath(backgroundFileId);

		if (!backgroundFileId || !cloudPath) {
			throw new Error('当前样板间未配置可直接生成的云端背景图，请先上传背景图后再生成');
		}

		const expiresAt = new Date(Date.now() + TICKET_EXPIRES_IN_MS);
		const result = await sourceCollection.add({
			uid: auth.uid,
			kind: 'background',
			cloudPath,
			ext: normalizeString(cloudPath.split('.').pop()).toLowerCase() || 'png',
			used: false,
			expiresAt,
			sceneTemplateId,
			sourceType: 'scene-template'
		});

		return {
			success: true,
			message: '样板间背景图凭证创建成功',
			sourceId: result.id,
			sceneTemplateId,
			backgroundFileId,
			backgroundUrl: normalizeString(scene.backgroundImage || backgroundFileId)
		};
	} catch (error) {
		return buildFailResponse(error.message || '样板间背景图凭证创建失败');
	}
};
