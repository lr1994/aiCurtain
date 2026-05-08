/**
 * 此云对象是演示如何调用微信虚拟支付其他API
 * 通过 const uniPayCo = uniCloud.importObject("uni-pay-co"); 获取云对象
 * 再通过 uniPayCo.requestWxpayVirtualApi 调用微信虚拟支付API
 */

module.exports = {
	_before: function() {

	},
	/**
	 * 查询用户代币余额
	 * @param {string} openid - 用户openid
	 */
	async queryUserBalance(data) {
		let {
			openid
		} = data;
		let userIp = this.getClientInfo().clientIP;
		const uniPayCo = uniCloud.importObject("uni-pay-co");
		let res = await uniPayCo.requestWxpayVirtualApi({
			method: "queryUserBalance",
			data: {
				openid, // 用户openid
				userIp, // 用户IP
			}
		});
		return res;
	},
	/**
	 * 扣减用户代币
	 * @param {string} openid - 用户openid
	 */
	async currencyPay(data) {
		let {
			openid
		} = data;
		let userIp = this.getClientInfo().clientIP;
		let outTradeNo = "test-" + Date.now(); // 商户订单号
		let payitem = JSON.stringify([{ "productid": "test001", "unit_price": 1, "quantity": 1 }]);
		let remark = "备注";
		let amount = 1; // 扣减的代币数量

		const uniPayCo = uniCloud.importObject("uni-pay-co");
		let res = await uniPayCo.requestWxpayVirtualApi({
			method: "currencyPay",
			data: {
				openid, // 用户openid
				userIp, // 用户IP
				amount, // 扣减的代币数量
				outTradeNo, // 商户订单号
				payitem,
				remark,
				deviceType: 1, // 平台类型1-安卓 仅支持传1
			}
		});
		res.amount = amount;
		return res;
	},
	// // 打开下方注释可体验 撤回的扣减用户代币、赠送用户代币

	/**
	 * 撤回的扣减用户代币
	 * @param {string} openid - 用户openid
	 */
	async cancelCurrencyPay(data) {
		let {
			openid,
			outTradeNo
		} = data;

		let userIp = this.getClientInfo().clientIP;
		let amount = 1; // 撤回扣减的代币数量

		let timestampStr = Date.now().toString();
		let lastFourDigits = timestampStr.substr(-4);

		const uniPayCo = uniCloud.importObject("uni-pay-co");
		let res = await uniPayCo.requestWxpayVirtualApi({
			method: "cancelCurrencyPay",
			data: {
				openid, // 用户openid
				userIp, // 用户IP
				amount, // 撤回扣减的代币数量
				outTradeNo, // 商户订单号
				outRefundNo: `${outTradeNo}-${lastFourDigits}`,
				deviceType: 1, // 平台类型1-安卓 仅支持传1
			}
		});

		return res;
	},
	/**
	 * 赠送用户代币
	 * @param {string} openid - 用户openid
	 */
	async presentCurrency(data) {
		let {
			openid
		} = data;

		let userIp = this.getClientInfo().clientIP;
		let outTradeNo = "test-" + Date.now(); // 商户订单号
		let amount = 1; // 赠送用户代币数量

		const uniPayCo = uniCloud.importObject("uni-pay-co");
		let res = await uniPayCo.requestWxpayVirtualApi({
			method: "presentCurrency",
			data: {
				openid, // 用户openid
				userIp, // 用户IP
				amount, // 赠送用户代币数量
				outTradeNo, // 商户订单号
				deviceType: 1, // 平台类型1-安卓 仅支持传1
			}
		});

		return res;
	},


}