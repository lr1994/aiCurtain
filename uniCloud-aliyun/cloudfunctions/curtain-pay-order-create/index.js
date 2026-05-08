'use strict';

const uniID = require('uni-id');
const defaultPackages = require('curtain-default-packages');
const { createMiniProgramOrder } = require('uni-pay-bridge');

const db = uniCloud.database();
const packageCollection = db.collection('curtain_point_package');
const orderCollection = db.collection('curtain_pay_order');

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
		throw new Error('请先登录后再下单');
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

function normalizePackage(item = {}) {
	return {
		_id: normalizeString(item._id),
		title: normalizeString(item.title),
		priceFen: Number(item.priceFen || 0),
		points: Number(item.points || 0),
		bonusPoints: Number(item.bonusPoints || 0),
		sort: Number(item.sort || 0),
		status: item.status !== false
	};
}

async function getActivePackage(packageId) {
	const normalizedPackageId = normalizeString(packageId);
	if (!normalizedPackageId) {
		throw new Error('请选择要购买的套餐');
	}

	const found = await packageCollection.where({
		_id: normalizedPackageId,
		status: true
	}).get();
	if (Array.isArray(found.data) && found.data.length > 0) {
		return normalizePackage(found.data[0]);
	}

	const fallback = defaultPackages
		.map((item) => normalizePackage(item))
		.find((item) => item._id === normalizedPackageId && item.status);
	if (fallback) {
		return fallback;
	}

	throw new Error('套餐不存在或已下架');
}

function buildOrderNo() {
	return `CP${Date.now()}${Math.random().toString().slice(2, 6)}`;
}

async function buildPaymentPayload({ auth, pkg, orderNo }) {
	const mode = normalizeString(process.env.CURTAIN_PAYMENT_MODE) || 'mock';
	if (mode === 'mock') {
		return {
			paymentParams: {
				mock: true,
				provider: 'wxpay',
				orderNo,
				amountFen: pkg.priceFen
			},
			payProvider: 'wxpay',
			payChannel: 'mp',
			thirdOrderNo: ''
		};
	}
	const openid = normalizeString(auth.openid || auth.wx_openid || auth.mp_openid);
	if (!openid) {
		throw new Error('未获取到微信用户标识，请重新登录后再试');
	}
	const uniPay = uniCloud.importObject('uni-pay-co');
	const payRes = await createMiniProgramOrder({
		uniPay,
		orderNo,
		totalFee: pkg.priceFen,
		title: pkg.title,
		uid: auth.uid,
		openid
	});
	return {
		paymentParams: payRes,
		payProvider: 'wxpay',
		payChannel: 'mp',
		thirdOrderNo: ''
	};
}

exports.main = async (event) => {
	try {
		const auth = await getCurrentUser(event || {});
		const pkg = await getActivePackage(event && event.packageId);
		const orderNo = buildOrderNo();
		const points = pkg.points + pkg.bonusPoints;
		
		const orderResult = await orderCollection.add({
			uid: auth.uid,
			packageId: pkg._id,
			packageTitle: pkg.title,
			orderNo,
			amountFen: pkg.priceFen,
			points,
			status: 'init',
			payType: 'wxpay',
			payProvider: 'wxpay',
			payChannel: 'mp',
			thirdOrderNo: '',
			transactionId: '',
			failReason: ''
		});
		const paymentPayload = await buildPaymentPayload({
			auth,
			pkg,
			orderNo
		});
		const thirdOrderNo = normalizeString(paymentPayload.paymentParams && paymentPayload.paymentParams.thirdOrderNo);
		await orderCollection.doc(orderResult.id).update({
			payProvider: paymentPayload.payProvider,
			payChannel: paymentPayload.payChannel,
			thirdOrderNo
		});

		return {
			success: true,
			orderNo,
			paymentParams: paymentPayload.paymentParams
		};
	} catch (error) {
		return buildFailResponse(error.message || '创建订单失败');
	}
};
