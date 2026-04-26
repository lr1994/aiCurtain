const test = require('node:test');
const assert = require('node:assert/strict');

const {
	createEmptyPointSummary,
	normalizePointSummary
} = require('../common/curtain-app/point-summary');

test('createEmptyPointSummary returns a zeroed account snapshot', () => {
	assert.deepEqual(createEmptyPointSummary(), {
		balance: 0,
		totalRecharge: 0,
		totalConsume: 0
	});
});

test('normalizePointSummary coerces numeric fields from cloud response', () => {
	assert.deepEqual(normalizePointSummary({
		balance: '20',
		totalRecharge: '25',
		totalConsume: '5'
	}), {
		balance: 20,
		totalRecharge: 25,
		totalConsume: 5
	});
});
