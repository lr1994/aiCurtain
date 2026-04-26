'use strict';

const uniID = require('uni-id');

const db = uniCloud.database();
const applyCollection = db.collection('curtain_manual_recharge_apply');

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
		throw new Error('请先登录后再提交补点申请');
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
		const contact = normalizeString(event && event.contact);
		const remark = normalizeString(event && event.remark);

		if (!contact) {
			return buildFailResponse('请填写联系方式');
		}

		await applyCollection.add({
			uid: auth.uid,
			contact,
			remark,
			status: 'pending'
		});

		return {
			success: true,
			message: '申请已提交'
		};
	} catch (error) {
		return buildFailResponse(error.message || '提交补点申请失败');
	}
};
