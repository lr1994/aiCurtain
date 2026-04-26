const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');

const projectRoot = path.resolve(__dirname, '..');
const createOrderModulePath = path.join(projectRoot, 'uniCloud-aliyun', 'cloudfunctions', 'curtain-pay-order-create', 'index.js');
const notifyModulePath = path.join(projectRoot, 'uniCloud-aliyun', 'cloudfunctions', 'curtain-pay-order-notify', 'index.js');
const listModulePath = path.join(projectRoot, 'uniCloud-aliyun', 'cloudfunctions', 'curtain-pay-order-list', 'index.js');

function loadCloudFunction(modulePath, { uniCloud, uniId, env = {} }) {
	const originalLoad = Module._load;
	const originalEnv = {};
	delete require.cache[modulePath];
	global.uniCloud = uniCloud;
	Object.keys(env).forEach((key) => {
		originalEnv[key] = process.env[key];
		process.env[key] = env[key];
	});

	Module._load = function patchedLoad(request, parent, isMain) {
		if (request === 'uni-id') {
			return uniId;
		}
		return originalLoad.call(this, request, parent, isMain);
	};

	try {
		return require(modulePath);
	} finally {
		Module._load = originalLoad;
		Object.keys(env).forEach((key) => {
			if (typeof originalEnv[key] === 'undefined') {
				delete process.env[key];
			} else {
				process.env[key] = originalEnv[key];
			}
		});
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
					throw new Error(`unexpected collection: ${name}`);
				}
			};
		}
	};

	const uniId = {
		async checkToken() {
			return {
				uid: 'user-1'
			};
		}
	};

	return {
		createOrder: loadCloudFunction(createOrderModulePath, {
			uniCloud,
			uniId,
			env: {
				CURTAIN_PAYMENT_MODE: 'mock'
			}
		}),
		notify: loadCloudFunction(notifyModulePath, {
			uniCloud,
			uniId
		}),
		orderList: loadCloudFunction(listModulePath, {
			uniCloud,
			uniId
		}),
		orders,
		pointAccounts,
		pointFlows
	};
}

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
