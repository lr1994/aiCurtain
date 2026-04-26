'use strict';

const uniID = require('uni-id');

const db = uniCloud.database();
const accountCollection = db.collection('curtain_point_account');

function buildFailResponse(message) {
	return {
		success: false,
		message
	};
}

async function getCurrentUser(event) {
	if (!event || !event.uniIdToken) {
		throw new Error('请先登录后再查看点数账户');
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

async function ensurePointAccount(uid) {
	const found = await accountCollection.where({ uid }).get();
	if (Array.isArray(found.data) && found.data.length > 0) {
		return found.data[0];
	}

	const account = {
		uid,
		balance: 0,
		totalRecharge: 0,
		totalConsume: 0,
		status: true
	};
	const result = await accountCollection.add(account);

	return {
		_id: result.id,
		...account
	};
}

exports.main = async (event) => {
	try {
		const auth = await getCurrentUser(event || {});
		const account = await ensurePointAccount(auth.uid);

		return {
			success: true,
			uid: account.uid,
			accountId: account._id || '',
			balance: Number(account.balance || 0),
			totalRecharge: Number(account.totalRecharge || 0),
			totalConsume: Number(account.totalConsume || 0),
			status: account.status !== false
		};
	} catch (error) {
		return buildFailResponse(error.message || '获取点数账户失败');
	}
};
