'use strict';

const uniID = require('uni-id');
const db = uniCloud.database();
const collection = db.collection('curtain_preview_source_file');

const ALLOWED_KINDS = ['background', 'texture'];
const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'gif'];
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
		throw new Error('请先登录后再获取上传凭证');
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

function validateKind(value) {
	const kind = normalizeString(value);
	if (!ALLOWED_KINDS.includes(kind)) {
		throw new Error('kind仅支持background或texture');
	}
	return kind;
}

function validateExtension(value) {
	const ext = normalizeString(value).toLowerCase();
	if (!/^[a-z0-9]{2,5}$/.test(ext) || !ALLOWED_EXTENSIONS.includes(ext)) {
		throw new Error('ext仅支持png、jpg、jpeg、webp、gif');
	}
	return ext;
}

function createCloudPath(uid, kind, ext) {
	const timestamp = Date.now();
	const random = Math.random().toString(36).slice(2, 10);
	return `curtain-preview/source/${uid}/${kind}-${timestamp}-${random}.${ext}`;
}

exports.main = async (event) => {
	try {
		const auth = await getCurrentUser(event || {});
		const kind = validateKind(event && event.kind);
		const ext = validateExtension(event && event.ext);
		const cloudPath = createCloudPath(auth.uid, kind, ext);
		const expiresAt = new Date(Date.now() + TICKET_EXPIRES_IN_MS);
		const result = await collection.add({
			uid: auth.uid,
			kind,
			cloudPath,
			ext,
			used: false,
			expiresAt
		});

		return {
			success: true,
			message: '上传凭证创建成功',
			sourceId: result.id,
			cloudPath,
			kind
		};
	} catch (error) {
		return buildFailResponse(error.message || '上传凭证创建失败');
	}
};
