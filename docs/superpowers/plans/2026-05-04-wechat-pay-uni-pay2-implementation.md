# WeChat Pay uni-pay 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mock recharge flow with real WeChat Mini Program payment via `uni-pay 2` while keeping `curtain_pay_order` as the business order source of truth.

**Architecture:** The payment gateway layer is introduced through `uni-pay 2`, but package lookup, business order creation, order list queries, point-account crediting, and flow records continue to live in the existing `curtain-pay-*` cloud functions. The front end only creates an order and calls `uni.requestPayment`; the final recharge result still depends on the service-side paid-order callback.

**Tech Stack:** uni-app Vue 2 page components, uniCloud aliyun cloud functions, `uni-pay 2`, Node.js `node:test`, `uni.requestPayment`, `uni-id`

---

## File Structure

**Create:**
- `uniCloud-aliyun/cloudfunctions/common/uni-pay-bridge/index.js` - Shared helper that wraps `uni-pay` order creation and normalizes gateway responses for business cloud functions.
- `uniCloud-aliyun/cloudfunctions/uni-pay-co/` - Official `uni-pay 2` cloud object and config payload after installation.
- `uniCloud-aliyun/database/opendb-pay-orders.schema.json` - `uni-pay` order table schema if the installer does not already add it.
- `docs/payment/wechat-pay-config.md` - Deployment notes for appid, mchid, API v3 key, cert serial number, and environment separation.

**Modify:**
- `pages/profile/recharge.vue` - Remove the mock branch and call `uni.requestPayment` with real params.
- `uniCloud-aliyun/cloudfunctions/curtain-pay-order-create/index.js` - Keep business-order creation but bridge to `uni-pay` for real payment params.
- `uniCloud-aliyun/cloudfunctions/curtain-pay-order-notify/index.js` - Keep idempotent recharge but accept normalized paid-order callback payload.
- `uniCloud-aliyun/cloudfunctions/curtain-pay-order-list/index.js` - Expose clearer payment status fields if needed.
- `uniCloud-aliyun/database/curtain_pay_order.schema.json` - Add bridge fields such as `transactionId`, `thirdOrderNo`, `payProvider`, `payChannel`, `failReason` when absent.
- `tests/curtain-payment-cloud.test.js` - Extend tests from mock-only assumptions to real gateway bridge expectations.

## Task 1: Install and configure uni-pay 2 as the payment gateway layer

**Files:**
- Create: `uniCloud-aliyun/cloudfunctions/uni-pay-co/*`
- Create: `uniCloud-aliyun/database/opendb-pay-orders.schema.json`
- Create: `docs/payment/wechat-pay-config.md`
- Modify: `uniCloud-aliyun/cloudfunctions/common/uni-pay-bridge/index.js`

- [ ] **Step 1: Write the failing payment bridge test expectation**

```js
// tests/curtain-payment-cloud.test.js

test('create order delegates real payment creation through uni-pay bridge', async () => {
	const harness = createHarness({
		env: { CURTAIN_PAYMENT_MODE: 'real' },
		uniPayBridge: {
			async createMiniProgramOrder(payload) {
				return {
					provider: 'wxpay',
					timeStamp: '1714800000',
					nonceStr: 'nonce-demo',
					package: 'prepay_id=wx123',
					signType: 'RSA',
					paySign: 'signed-demo',
					thirdOrderNo: 'upay-001'
				};
			}
		}
	});

	const result = await harness.createOrder.main({
		uniIdToken: 'token',
		packageId: 'pkg-1'
	});

	assert.equal(result.success, true);
	assert.equal(result.paymentParams.package, 'prepay_id=wx123');
	assert.equal(harness.orders[0].thirdOrderNo, 'upay-001');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests\curtain-payment-cloud.test.js`
Expected: FAIL with missing `uniPayBridge` support or missing `thirdOrderNo` persistence.

- [ ] **Step 3: Add the gateway bridge helper and payment config notes**

```js
// uniCloud-aliyun/cloudfunctions/common/uni-pay-bridge/index.js
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
		custom: { uid, orderNo }
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
```

```md
<!-- docs/payment/wechat-pay-config.md -->
# 微信支付配置说明

- 小程序 `AppID`
- 小程序 `AppSecret`
- 商户号 `mchId`
- API v3 密钥
- 商户证书序列号
- 商户私钥
- 正式环境与测试环境分开配置
```

- [ ] **Step 4: Run test to verify the bridge expectation can pass once business code is wired**

Run: `node --test tests\curtain-payment-cloud.test.js`
Expected: still FAIL, but now failure should move from missing bridge file to business cloud function wiring.

- [ ] **Step 5: Commit**

```bash
git add uniCloud-aliyun/cloudfunctions/common/uni-pay-bridge/index.js docs/payment/wechat-pay-config.md tests/curtain-payment-cloud.test.js
git commit -m "chore: scaffold uni-pay bridge and payment config notes"
```

## Task 2: Convert business order creation from mock params to real payment params

**Files:**
- Modify: `uniCloud-aliyun/cloudfunctions/curtain-pay-order-create/index.js`
- Modify: `uniCloud-aliyun/database/curtain_pay_order.schema.json`
- Test: `tests/curtain-payment-cloud.test.js`

- [ ] **Step 1: Write the failing create-order persistence tests**

```js
// tests/curtain-payment-cloud.test.js

test('create order stores gateway bridge fields for real payment mode', async () => {
	const harness = createHarness({
		env: { CURTAIN_PAYMENT_MODE: 'real' },
		uniPayBridge: {
			async createMiniProgramOrder() {
				return {
					provider: 'wxpay',
					timeStamp: '1714800000',
					nonceStr: 'nonce-demo',
					package: 'prepay_id=wx123',
					signType: 'RSA',
					paySign: 'signed-demo',
					thirdOrderNo: 'upay-001'
				};
			}
		}
	});

	const result = await harness.createOrder.main({ uniIdToken: 'token', packageId: 'pkg-1' });

	assert.equal(result.success, true);
	assert.equal(result.paymentParams.mock, undefined);
	assert.equal(harness.orders[0].status, 'init');
	assert.equal(harness.orders[0].payProvider, 'wxpay');
	assert.equal(harness.orders[0].payChannel, 'mp');
	assert.equal(harness.orders[0].thirdOrderNo, 'upay-001');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests\curtain-payment-cloud.test.js`
Expected: FAIL because `curtain-pay-order-create` still returns mock params and does not persist bridge fields.

- [ ] **Step 3: Write minimal real-payment implementation in the create cloud function**

```js
// inside curtain-pay-order-create/index.js
const { createMiniProgramOrder } = require('../common/uni-pay-bridge');

async function buildPaymentParams({ mode, uniPay, orderNo, amountFen, title, uid, openid }) {
	if (mode !== 'real') {
		return {
			paymentParams: {
				mock: true,
				provider: 'wxpay',
				orderNo,
				amountFen
			},
			thirdOrderNo: ''
		};
	}
	const paymentParams = await createMiniProgramOrder({
		uniPay,
		orderNo,
		totalFee: amountFen,
		title,
		uid,
		openid
	});
	return {
		paymentParams,
		thirdOrderNo: paymentParams.thirdOrderNo
	};
}
```

```js
await orderCollection.add({
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
	thirdOrderNo: paymentPayload.thirdOrderNo,
	transactionId: '',
	failReason: ''
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests\curtain-payment-cloud.test.js`
Expected: PASS for create-order real payment cases; notify-related tests may still be unchanged.

- [ ] **Step 5: Commit**

```bash
git add uniCloud-aliyun/cloudfunctions/curtain-pay-order-create/index.js uniCloud-aliyun/database/curtain_pay_order.schema.json tests/curtain-payment-cloud.test.js
git commit -m "feat: bridge business orders to uni-pay create order"
```

## Task 3: Keep paid-order callback idempotent for real gateway payloads

**Files:**
- Modify: `uniCloud-aliyun/cloudfunctions/curtain-pay-order-notify/index.js`
- Test: `tests/curtain-payment-cloud.test.js`

- [ ] **Step 1: Write the failing notify tests for real gateway payloads**

```js
// tests/curtain-payment-cloud.test.js

test('notify marks order failed when gateway reports failure', async () => {
	const harness = createHarness({
		orders: [{ _id: 'order-1', uid: 'user-1', orderNo: 'CP001', amountFen: 990, points: 10, status: 'init', payType: 'wxpay' }]
	});

	const result = await harness.notify.main({
		orderNo: 'CP001',
		tradeState: 'FAIL',
		transactionId: 'wx-fail-1',
		failReason: 'USERPAYING'
	});

	assert.equal(result.success, true);
	assert.equal(harness.orders[0].status, 'fail');
	assert.equal(harness.orders[0].failReason, 'USERPAYING');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests\curtain-payment-cloud.test.js`
Expected: FAIL because failed-order reasons are not stored and notify payload is too narrow.

- [ ] **Step 3: Write minimal callback normalization and idempotent persistence**

```js
function normalizeNotifyPayload(event = {}) {
	return {
		orderNo: normalizeString(event.orderNo || event.outTradeNo),
		tradeState: normalizeString(event.tradeState || event.trade_state),
		transactionId: normalizeString(event.transactionId || event.transaction_id),
		failReason: normalizeString(event.failReason || event.trade_state_desc)
	};
}
```

```js
if (payload.tradeState !== 'SUCCESS') {
	await orderCollection.doc(order._id).update({
		status: 'fail',
		transactionId: payload.transactionId,
		failReason: payload.failReason
	});
	return { success: true, orderNo: payload.orderNo, status: 'fail' };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests\curtain-payment-cloud.test.js`
Expected: PASS for success idempotency and failure persistence.

- [ ] **Step 5: Commit**

```bash
git add uniCloud-aliyun/cloudfunctions/curtain-pay-order-notify/index.js tests/curtain-payment-cloud.test.js
git commit -m "feat: normalize uni-pay notify payloads for point recharge"
```

## Task 4: Replace the recharge page mock flow with real `uni.requestPayment`

**Files:**
- Modify: `pages/profile/recharge.vue`
- Test: `tests/curtain-payment-cloud.test.js` (business-only tests stay green)

- [ ] **Step 1: Write the expected front-end requestPayment flow as a checklist comment in the plan and manually inspect current code**

```js
// recharge.vue target behavior
// 1. createRechargeOrder receives real paymentParams
// 2. call uni.requestPayment({ provider: 'wxpay', ...paymentParams })
// 3. on success: toast syncing result, refresh packages/order state
// 4. on fail with errMsg containing cancel: toast 已取消支付
// 5. on other fail: toast 支付失败
```

- [ ] **Step 2: Run existing cloud tests as a regression guard before touching the page**

Run: `node --test tests\curtain-payment-cloud.test.js`
Expected: PASS, confirming cloud-side business logic is stable before front-end edits.

- [ ] **Step 3: Write the minimal front-end implementation**

```js
async createRechargeOrder(item) {
	this.payingPackageId = item._id;
	try {
		const res = await uniCloud.callFunction({
			name: 'curtain-pay-order-create',
			data: { packageId: item._id }
		});
		const result = res.result || {};
		if (!result.success) {
			throw new Error(result.message || '创建订单失败');
		}
		await uni.requestPayment({
			provider: 'wxpay',
			...result.paymentParams
		});
		uni.showToast({ title: '支付成功，正在同步到账结果', icon: 'none' });
	} catch (error) {
		const message = this.normalizeString(error && error.errMsg || error && error.message);
		uni.showToast({
			title: /cancel/i.test(message) ? '已取消支付' : (message || '支付失败'),
			icon: 'none'
		});
	} finally {
		this.payingPackageId = '';
	}
}
```

- [ ] **Step 4: Re-run business tests and perform manual recharge-page smoke check**

Run: `node --test tests\curtain-payment-cloud.test.js`
Expected: PASS

Manual smoke:
- Open the recharge page.
- Click one package.
- Confirm no mock modal appears.
- Confirm the page now depends on real `uni.requestPayment`.

- [ ] **Step 5: Commit**

```bash
git add pages/profile/recharge.vue
git commit -m "feat: launch real wechat payment from recharge page"
```

## Task 5: Finalize order list/status exposure and deployment notes

**Files:**
- Modify: `uniCloud-aliyun/cloudfunctions/curtain-pay-order-list/index.js`
- Modify: `docs/payment/wechat-pay-config.md`
- Test: `tests/curtain-payment-cloud.test.js`

- [ ] **Step 1: Write the failing order-list status exposure test**

```js
// tests/curtain-payment-cloud.test.js

test('order list exposes payment provider metadata for the current user', async () => {
	const harness = createHarness({
		orders: [{
			_id: 'order-a', uid: 'user-1', orderNo: 'A', status: 'success', points: 20,
			amountFen: 1990, createTime: 100, payProvider: 'wxpay', payChannel: 'mp', thirdOrderNo: 'upay-1'
		}]
	});

	const result = await harness.orderList.main({ uniIdToken: 'token', pageNo: 1, pageSize: 10 });
	assert.equal(result.list[0].payProvider, 'wxpay');
	assert.equal(result.list[0].payChannel, 'mp');
	assert.equal(result.list[0].thirdOrderNo, 'upay-1');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests\curtain-payment-cloud.test.js`
Expected: FAIL because `normalizeOrder` does not yet expose the new payment metadata.

- [ ] **Step 3: Write minimal list normalization and deployment checklist updates**

```js
function normalizeOrder(item = {}) {
	return {
		_id: normalizeString(item._id),
		orderNo: normalizeString(item.orderNo),
		packageId: normalizeString(item.packageId),
		packageTitle: normalizeString(item.packageTitle),
		amountFen: Number(item.amountFen || 0),
		points: Number(item.points || 0),
		status: normalizeString(item.status) || 'init',
		payType: normalizeString(item.payType) || 'wxpay',
		payProvider: normalizeString(item.payProvider) || 'wxpay',
		payChannel: normalizeString(item.payChannel) || 'mp',
		thirdOrderNo: normalizeString(item.thirdOrderNo),
		createTime: Number(item.createTime || 0),
		payTime: item.payTime || null
	};
}
```

```md
## 上线前核对
- 已在 uniCloud 服务空间安装 `uni-pay 2`
- 已配置 `wxpay.mp` 节点
- 已填 `AppID`、`AppSecret`、`mchId`
- 已填 API v3 密钥、商户私钥、证书序列号
- 已验证回调地址可访问
- 已在真机完成一笔 0.01 元或测试套餐冒烟支付
```

- [ ] **Step 4: Run all payment tests to verify the full plan is green**

Run: `node --test tests\curtain-payment-cloud.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add uniCloud-aliyun/cloudfunctions/curtain-pay-order-list/index.js docs/payment/wechat-pay-config.md tests/curtain-payment-cloud.test.js
git commit -m "docs: finalize wechat payment deployment checklist"
```

## Self-Review

- Spec coverage: payment gateway replacement, real miniapp pay params, service-side idempotent crediting, list status continuity, and config documentation are all mapped to Tasks 1-5.
- Placeholder scan: removed placeholder phrasing; each task contains exact files, code, commands, and expected outcomes.
- Type consistency: uses `orderNo`, `thirdOrderNo`, `payProvider`, `payChannel`, `transactionId`, `failReason` consistently across create, notify, list, and test steps.