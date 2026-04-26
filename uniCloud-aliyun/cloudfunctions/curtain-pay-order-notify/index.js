'use strict';

const db = uniCloud.database();
const orderCollection = db.collection('curtain_pay_order');
const accountCollection = db.collection('curtain_point_account');
const flowCollection = db.collection('curtain_point_flow');

function normalizeString(value) {
	return typeof value === 'string' ? value.trim() : '';
}

function buildFailResponse(message) {
	return {
		success: false,
		message
	};
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

async function findOrderByNo(orderNo) {
	const found = await orderCollection.where({
		orderNo
	}).get();
	return Array.isArray(found.data) && found.data.length > 0 ? found.data[0] : null;
}

async function markOrderPaid(order, transactionId) {
	if (order.status === 'success') {
		return {
			success: true,
			skipped: true
		};
	}
	const account = await ensurePointAccount(order.uid);
	const rechargeAmount = Number(order.points || 0);
	const balanceAfter = Number(account.balance || 0) + rechargeAmount;

	await orderCollection.doc(order._id).update({
		status: 'success',
		transactionId,
		payTime: new Date()
	});
	await accountCollection.doc(account._id).update({
		balance: balanceAfter,
		totalRecharge: Number(account.totalRecharge || 0) + rechargeAmount
	});
	await flowCollection.add({
		uid: order.uid,
		type: 'recharge',
		amount: rechargeAmount,
		balanceAfter,
		bizType: 'order',
		bizId: order.orderNo,
		remark: '套餐支付成功充值点数',
		status: true
	});

	return {
		success: true,
		skipped: false
	};
}

exports.main = async (event) => {
	try {
		const orderNo = normalizeString(event && event.orderNo);
		const tradeState = normalizeString(event && event.tradeState);
		const transactionId = normalizeString(event && event.transactionId);

		if (!orderNo) {
			return buildFailResponse('订单号不能为空');
		}

		const order = await findOrderByNo(orderNo);
		if (!order) {
			return buildFailResponse('订单不存在');
		}

		if (tradeState !== 'SUCCESS') {
			await orderCollection.doc(order._id).update({
				status: 'fail',
				transactionId
			});
			return {
				success: true,
				orderNo,
				status: 'fail'
			};
		}

		await markOrderPaid(order, transactionId);

		return {
			success: true,
			orderNo,
			status: 'success'
		};
	} catch (error) {
		return buildFailResponse(error.message || '处理支付回调失败');
	}
};
