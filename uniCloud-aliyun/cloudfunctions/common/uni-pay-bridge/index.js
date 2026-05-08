'use strict';

function normalizeString(value) {
	return typeof value === 'string' ? value.trim() : '';
}

async function createMiniProgramOrder({ uniPay, orderNo, totalFee, title, uid, openid }) {
	const result = await uniPay.createOrder({
		provider: 'wxpay',
		order_no: orderNo,
		total_fee: totalFee,
		description: title,
		type: 'miniapp',
		openid,
		custom: {
			uid,
			orderNo
		}
	});

	return {
		provider: 'wxpay',
		timeStamp: normalizeString(result.timeStamp),
		nonceStr: normalizeString(result.nonceStr),
		package: normalizeString(result.package),
		signType: normalizeString(result.signType) || 'RSA',
		paySign: normalizeString(result.paySign),
		thirdOrderNo: normalizeString(result.outTradeNo || result.order_no)
	};
}

module.exports = {
	createMiniProgramOrder
};
