const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');

const projectRoot = path.resolve(__dirname, '..');
const createOrderModulePath = path.join(projectRoot, 'uniCloud-aliyun', 'cloudfunctions', 'curtain-pay-order-create', 'index.js');
const notifyModulePath = path.join(projectRoot, 'uniCloud-aliyun', 'cloudfunctions', 'curtain-pay-order-notify', 'index.js');
const listModulePath = path.join(projectRoot, 'uniCloud-aliyun', 'cloudfunctions', 'curtain-pay-order-list', 'index.js');
const createOrderPackageJsonPath = path.join(projectRoot, 'uniCloud-aliyun', 'cloudfunctions', 'curtain-pay-order-create', 'package.json');
const defaultPackagesCommonModulePath = path.join(projectRoot, 'uniCloud-aliyun', 'cloudfunctions', 'common', 'curtain-default-packages', 'index.js');
const uniPayBridgeModulePath = path.join(projectRoot, 'uniCloud-aliyun', 'cloudfunctions', 'common', 'uni-pay-bridge', 'index.js');
const uniPayConfigPath = path.join(projectRoot, 'uni_modules', 'uni-config-center', 'uniCloud', 'cloudfunctions', 'common', 'uni-config-center', 'uni-pay', 'config.js');

function loadCloudFunction(modulePath, { uniCloud, uniId, uniPayBridge, uniPay, env = {} }) {
	const originalLoad = Module._load;
	delete require.cache[modulePath];
	global.uniCloud = uniCloud;

	Module._load = function patchedLoad(request, parent, isMain) {
		if (request === 'uni-id') {
			return uniId;
		}
		if (request === 'uni-pay' && uniPay) {
			return uniPay;
		}
		if (request === 'curtain-default-packages') {
			return require(defaultPackagesCommonModulePath);
		}
		if (/uni-pay-bridge/.test(request)) {
			return uniPayBridge || originalLoad.call(this, uniPayBridgeModulePath, parent, isMain);
		}
		return originalLoad.call(this, request, parent, isMain);
	};

	try {
		const loadedModule = require(modulePath);
		if (!loadedModule || typeof loadedModule.main !== 'function') {
			return loadedModule;
		}
		return {
			...loadedModule,
			async main(event) {
				const originalEnv = {};
				Object.keys(env).forEach((key) => {
					originalEnv[key] = process.env[key];
					process.env[key] = env[key];
				});
				try {
					return await loadedModule.main(event);
				} finally {
					Object.keys(env).forEach((key) => {
						if (typeof originalEnv[key] === 'undefined') {
							delete process.env[key];
						} else {
							process.env[key] = originalEnv[key];
						}
					});
				}
			}
		};
	} finally {
		Module._load = originalLoad;
	}
}

function createHarness(options = {}) {
	const packages = (options.packages || [
		{
			_id: 'pkg-1',
			title: '体验包',
			priceFen: 990,
			points: 10,
			bonusPoints: 0,
			sort: 10,
			status: true
		}
	]).map((item) => ({ ...item }));
	const orders = (options.orders || []).map((item) => ({ ...item }));
	const pointAccounts = (options.pointAccounts || []).map((item) => ({ ...item }));
	const pointFlows = [];
	const users = (options.users || []).map((item) => ({ ...item }));

	function makeQueryChain(list, filter = {}) {
		const filteredList = list.filter((item) => {
			return Object.keys(filter).every((key) => item[key] === filter[key]);
		});
		return {
			where(nextFilter = {}) {
				return makeQueryChain(filteredList, nextFilter);
			},
			orderBy(field, direction) {
				const factor = direction === 'desc' ? -1 : 1;
				const sorted = filteredList.slice().sort((left, right) => {
					const leftValue = Number(left[field] || 0);
					const rightValue = Number(right[field] || 0);
					return (leftValue - rightValue) * factor;
				});
				return makeQueryChain(sorted);
			},
			skip(count) {
				return makeQueryChain(filteredList.slice(Number(count || 0)), {});
			},
			limit(count) {
				return makeQueryChain(filteredList.slice(0, Number(count || 0)), {});
			},
			async get() {
				return {
					data: filteredList.map((item) => ({ ...item }))
				};
			},
			async count() {
				return {
					total: filteredList.length
				};
			},
			async update(data) {
				let updated = 0;
				list.forEach((item) => {
					const matched = Object.keys(filter).every((key) => item[key] === filter[key]);
					if (matched) {
						Object.assign(item, data);
						updated += 1;
					}
				});
				return { updated };
			}
		};
	}

	const orderCollection = {
		where(filter = {}) {
			return makeQueryChain(orders, filter);
		},
		async add(data) {
			const record = {
				_id: `order-${orders.length + 1}`,
				createTime: Date.now(),
				updateTime: Date.now(),
				...data
			};
			orders.push(record);
			return {
				id: record._id
			};
		},
		doc(id) {
			return {
				async update(data) {
					const target = orders.find((item) => item._id === id);
					if (!target) {
						return { updated: 0 };
					}
					Object.assign(target, data);
					return { updated: 1 };
				}
			};
		}
	};

	const packageCollection = {
		where(filter = {}) {
			return makeQueryChain(packages, filter);
		}
	};

	const pointAccountCollection = {
		where(filter = {}) {
			return makeQueryChain(pointAccounts, filter);
		},
		async add(data) {
			const record = {
				_id: `account-${pointAccounts.length + 1}`,
				...data
			};
			pointAccounts.push(record);
			return {
				id: record._id
			};
		},
		doc(id) {
			return {
				async update(data) {
					const target = pointAccounts.find((item) => item._id === id);
					if (!target) {
						return { updated: 0 };
					}
					Object.assign(target, data);
					return { updated: 1 };
				}
			};
		}
	};

	const pointFlowCollection = {
		async add(data) {
			const record = {
				_id: `flow-${pointFlows.length + 1}`,
				...data
			};
			pointFlows.push(record);
			return {
				id: record._id
			};
		},
		where(filter = {}) {
			return makeQueryChain(pointFlows, filter);
		}
	};

	const userCollection = {
		doc(id) {
			return {
				async get() {
					const target = users.find((item) => item._id === id);
					return {
						data: target ? [{ ...target }] : []
					};
				}
			};
		}
	};

	const uniCloud = {
		database() {
			return {
				collection(name) {
					if (name === 'curtain_point_package') {
						return packageCollection;
					}
					if (name === 'curtain_pay_order') {
						return orderCollection;
					}
					if (name === 'curtain_point_account') {
						return pointAccountCollection;
					}
					if (name === 'curtain_point_flow') {
						return pointFlowCollection;
					}
					if (name === 'uni-id-users') {
						return userCollection;
					}
					throw new Error(`unexpected collection: ${name}`);
				}
			};
		},
		importObject(name) {
			if (name === 'uni-pay-co') {
				return options.uniPay || {
					async createOrder() {
						return {};
					}
				};
			}
			throw new Error(`unexpected cloud object: ${name}`);
		}
	};

	const uniId = options.uniId || {
		async checkToken() {
			return {
				uid: 'user-1',
				wx_openid: 'openid-1'
			};
		}
	};
	const env = {
		CURTAIN_PAYMENT_MODE: 'mock',
		...(options.env || {})
	};
	const uniPayBridge = options.uniPayBridge;
	const uniPay = options.uniPayModule || {
		initWeixin() {
			return {
				async getOrderInfo() {
					return {
						mock: true,
						provider: 'wxpay'
					};
				}
			};
		}
	};

	return {
		createOrder: loadCloudFunction(createOrderModulePath, {
			uniCloud,
			uniId,
			uniPayBridge,
			uniPay,
			env
		}),
		notify: loadCloudFunction(notifyModulePath, {
			uniCloud,
			uniId,
			uniPayBridge
		}),
		orderList: loadCloudFunction(listModulePath, {
			uniCloud,
			uniId,
			uniPayBridge
		}),
		orders,
		pointAccounts,
		pointFlows
	};
}

test('create order delegates real payment creation through uni-pay bridge', async () => {
	const harness = createHarness({
		env: {
			CURTAIN_PAYMENT_MODE: 'real'
		},
		uniPay: {
			async createOrder() {
				return {};
			}
		},
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

	const result = await harness.createOrder.main({
		uniIdToken: 'token',
		packageId: 'pkg-1'
	});

	assert.equal(result.success, true);
	assert.equal(result.paymentParams.package, 'prepay_id=wx123');
	assert.equal(result.paymentParams.paySign, 'signed-demo');
	assert.equal(result.paymentParams.mock, undefined);
	assert.equal(harness.orders[0].payProvider, 'wxpay');
	assert.equal(harness.orders[0].payChannel, 'mp');
	assert.equal(harness.orders[0].thirdOrderNo, 'upay-001');
});

test('create order stores package points and amount before payment', async () => {
	const harness = createHarness();

	const result = await harness.createOrder.main({
		uniIdToken: 'token',
		packageId: 'pkg-1'
	});

	assert.equal(result.success, true);
	assert.equal(harness.orders.length, 1);
	assert.equal(harness.orders[0].points, 10);
	assert.equal(harness.orders[0].amountFen, 990);
	assert.equal(harness.orders[0].status, 'init');
	assert.equal(result.paymentParams.mock, true);
});

test('create order resolves weixin openid from uni-id user profile when token payload only contains uid', async () => {
	const harness = createHarness({
		env: {
			CURTAIN_PAYMENT_MODE: 'real'
		},
		users: [
			{
				_id: 'user-1',
				wx_openid: {
					'mp-weixin': 'openid-from-profile'
				}
			}
		],
		uniId: {
			async checkToken() {
				return {
					uid: 'user-1'
				};
			}
		},
		uniPayBridge: {
			async createMiniProgramOrder({ openid }) {
				return {
					provider: 'wxpay',
					timeStamp: '1714800000',
					nonceStr: 'nonce-demo',
					package: `prepay_id=${openid}`,
					signType: 'RSA',
					paySign: 'signed-demo',
					thirdOrderNo: 'upay-002'
				};
			}
		}
	});

	const result = await harness.createOrder.main({
		uniIdToken: 'token',
		packageId: 'pkg-1'
	});

	assert.equal(result.success, true);
	assert.equal(result.paymentParams.package, 'prepay_id=openid-from-profile');
});

test('notify success updates order once and increments point balance once', async () => {
	const harness = createHarness({
		orders: [
			{
				_id: 'order-1',
				uid: 'user-1',
				packageId: 'pkg-1',
				orderNo: 'CP202604260001',
				amountFen: 990,
				points: 10,
				status: 'init',
				payType: 'wxpay'
			}
		],
		pointAccounts: [
			{
				_id: 'account-1',
				uid: 'user-1',
				balance: 0,
				totalRecharge: 0,
				totalConsume: 0,
				status: true
			}
		]
	});

	await harness.notify.main({
		orderNo: 'CP202604260001',
		tradeState: 'SUCCESS',
		transactionId: 'wx-1'
	});
	await harness.notify.main({
		orderNo: 'CP202604260001',
		tradeState: 'SUCCESS',
		transactionId: 'wx-1'
	});

	assert.equal(harness.pointAccounts[0].balance, 10);
	assert.equal(harness.pointAccounts[0].totalRecharge, 10);
	assert.equal(harness.pointFlows.length, 1);
	assert.equal(harness.pointFlows[0].type, 'recharge');
	assert.equal(harness.orders[0].status, 'success');
});

test('notify marks order failed when gateway reports failure', async () => {
	const harness = createHarness({
		orders: [
			{
				_id: 'order-1',
				uid: 'user-1',
				orderNo: 'CP001',
				amountFen: 990,
				points: 10,
				status: 'init',
				payType: 'wxpay'
			}
		]
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

test('order list returns only current user orders sorted by createTime desc', async () => {
	const harness = createHarness({
		orders: [
			{
				_id: 'order-a',
				uid: 'user-1',
				orderNo: 'A',
				status: 'success',
				points: 20,
				amountFen: 1990,
				createTime: 100
			},
			{
				_id: 'order-b',
				uid: 'user-2',
				orderNo: 'B',
				status: 'init',
				points: 10,
				amountFen: 990,
				createTime: 300
			},
			{
				_id: 'order-c',
				uid: 'user-1',
				orderNo: 'C',
				status: 'init',
				points: 30,
				amountFen: 2990,
				createTime: 200
			}
		]
	});

	const result = await harness.orderList.main({
		uniIdToken: 'token',
		pageNo: 1,
		pageSize: 10
	});

	assert.equal(result.success, true);
	assert.deepEqual(result.list.map((item) => item.orderNo), ['C', 'A']);
	assert.equal(result.total, 2);
});

test('order list exposes payment provider metadata for the current user', async () => {
	const harness = createHarness({
		orders: [
			{
				_id: 'order-a',
				uid: 'user-1',
				orderNo: 'A',
				status: 'success',
				points: 20,
				amountFen: 1990,
				createTime: 100,
				payProvider: 'wxpay',
				payChannel: 'mp',
				thirdOrderNo: 'upay-1'
			}
		]
	});

	const result = await harness.orderList.main({
		uniIdToken: 'token',
		pageNo: 1,
		pageSize: 10
	});

	assert.equal(result.success, true);
	assert.equal(result.list[0].payProvider, 'wxpay');
	assert.equal(result.list[0].payChannel, 'mp');
	assert.equal(result.list[0].thirdOrderNo, 'upay-1');
});

test('create order cloud function declares the shared default package common module', async () => {
	const cloudFunctionPackage = require(createOrderPackageJsonPath);

	assert.equal(cloudFunctionPackage.dependencies['curtain-default-packages'], 'file:../common/curtain-default-packages');
	assert.equal(cloudFunctionPackage.dependencies['uni-pay-bridge'], 'file:../common/uni-pay-bridge');
});

test('uni-pay config exposes mini program appId under wxpay.mp', async () => {
	delete require.cache[uniPayConfigPath];
	const uniPayConfig = require(uniPayConfigPath);

	assert.equal(uniPayConfig.wxpay.mp.appId, 'wx94fd4d1fa4b28056');
	assert.equal(uniPayConfig.wxpay.mp.mchId, '1745286982');
});
