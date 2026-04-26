function createEmptyPointSummary() {
	return {
		balance: 0,
		totalRecharge: 0,
		totalConsume: 0
	};
}

function normalizePointSummary(result = {}) {
	return {
		balance: Number(result.balance || 0),
		totalRecharge: Number(result.totalRecharge || 0),
		totalConsume: Number(result.totalConsume || 0)
	};
}

module.exports = {
	createEmptyPointSummary,
	normalizePointSummary
};
