const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');

const projectRoot = path.resolve(__dirname, '..');
const pointSummaryModulePath = path.join(projectRoot, 'uniCloud-aliyun', 'cloudfunctions', 'curtain-point-summary', 'index.js');
const rechargeApplyModulePath = path.join(projectRoot, 'uniCloud-aliyun', 'cloudfunctions', 'curtain-manual-recharge-apply-create', 'index.js');

function loadCloudFunction(modulePath, { uniCloud, uniId }) {
	const originalLoad = Module._load;
	delete require.cache[modulePath];
	global.uniCloud = uniCloud;

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
	}
}

function createQueryResult(list) {
	return {
		data: list.map((item) => ({ ...item }))
	};
}

function createHarness(options = {}) {
	const pointAccounts = (options.pointAccounts || []).map((item) => ({ ...item }));
	const rechargeApplies = [];

	const accountCollection = {
		where(filter = {}) {
			return {
				async get() {
					return createQueryResult(pointAccounts.filter((item) => {
						return Object.keys(filter).every((key) => item[key] === filter[key]);
					}));
				}
			};
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
		}
	};

	const rechargeApplyCollection = {
		async add(data) {
			const record = {
				_id: `apply-${rechargeApplies.length + 1}`,
				...data
			};
			rechargeApplies.push(record);
			return {
				id: record._id
			};
		}
	};

	const uniCloud = {
		database() {
			return {
				collection(name) {
					if (name === 'curtain_point_account') {
						return accountCollection;
					}
					if (name === 'curtain_manual_recharge_apply') {
						return rechargeApplyCollection;
					}
					throw new Error(`unexpected collection: ${name}`);
				}
			};
		}
	};

	const uniId = {
		async checkToken(token) {
			if (token === 'bad-token') {
				return {
					code: 30203
				};
			}
			return {
				uid: 'user-1'
			};
		}
	};

	return {
		pointSummary: loadCloudFunction(pointSummaryModulePath, { uniCloud, uniId }),
		rechargeApply: loadCloudFunction(rechargeApplyModulePath, { uniCloud, uniId }),
		pointAccounts,
		rechargeApplies
	};
}

test('point summary creates zero-balance account for first-time user', async () => {
	const harness = createHarness();

	const result = await harness.pointSummary.main({
		uniIdToken: 'token'
	});

	assert.equal(result.success, true);
	assert.equal(result.balance, 0);
	assert.equal(result.totalRecharge, 0);
	assert.equal(result.totalConsume, 0);
	assert.equal(harness.pointAccounts.length, 1);
	assert.equal(harness.pointAccounts[0].uid, 'user-1');
});

test('manual recharge apply rejects empty contact', async () => {
	const harness = createHarness();

	const result = await harness.rechargeApply.main({
		uniIdToken: 'token',
		contact: '',
		remark: ''
	});

	assert.equal(result.success, false);
	assert.equal(result.message, '请填写联系方式');
	assert.equal(harness.rechargeApplies.length, 0);
});

test('manual recharge apply stores a pending application for the current user', async () => {
	const harness = createHarness();

	const result = await harness.rechargeApply.main({
		uniIdToken: 'token',
		contact: '13800138000',
		remark: '门店演示账号补点'
	});

	assert.equal(result.success, true);
	assert.equal(result.message, '申请已提交');
	assert.equal(harness.rechargeApplies.length, 1);
	assert.equal(harness.rechargeApplies[0].uid, 'user-1');
	assert.equal(harness.rechargeApplies[0].status, 'pending');
	assert.equal(harness.rechargeApplies[0].contact, '13800138000');
});
