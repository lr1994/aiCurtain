'use strict';

const uniID = require('uni-id');

const db = uniCloud.database();
const collection = db.collection('curtain_preview_record');

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
		throw new Error('请先登录后再删除作品');
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

exports.main = async (event) => {
	try {
		const auth = await getCurrentUser(event || {});
		const recordId = normalizeString(event && event.recordId);
		if (!recordId) {
			return buildFailResponse('recordId不能为空');
		}

		const result = await collection.where({
			_id: recordId,
			uid: auth.uid
		}).remove();

		if (!result || Number(result.deleted || 0) < 1) {
			return buildFailResponse('作品不存在或无权删除');
		}

		return {
			success: true,
			message: '作品已删除'
		};
	} catch (error) {
		return buildFailResponse(error.message || '删除作品失败');
	}
};
