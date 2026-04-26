function normalizeString(value) {
	return typeof value === 'string' ? value.trim() : '';
}

function padNumber(value) {
	return String(value).padStart(2, '0');
}

function formatTimestamp(value) {
	const numericValue = Number(value || 0);
	if (!numericValue) {
		return '';
	}
	const date = new Date(numericValue);
	if (Number.isNaN(date.getTime())) {
		return '';
	}
	return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())} ${padNumber(date.getHours())}:${padNumber(date.getMinutes())}`;
}

function getStatusMeta(status) {
	const normalized = normalizeString(status);
	if (normalized === 'success') {
		return {
			statusLabel: '已完成',
			statusTone: 'success'
		};
	}
	if (normalized === 'fail') {
		return {
			statusLabel: '生成失败',
			statusTone: 'fail'
		};
	}
	return {
		statusLabel: '生成中',
		statusTone: 'processing'
	};
}

export function normalizeWorkRecord(item = {}) {
	const statusMeta = getStatusMeta(item.status);
	return {
		_id: normalizeString(item._id),
		status: normalizeString(item.status) || 'processing',
		statusLabel: statusMeta.statusLabel,
		statusTone: statusMeta.statusTone,
		prompt: normalizeString(item.prompt),
		promptText: normalizeString(item.prompt) || '未填写提示词',
		model: normalizeString(item.model),
		errorMessage: normalizeString(item.errorMessage),
		coverUrl: normalizeString(item.resultUrl) || normalizeString(item.backgroundUrl) || normalizeString(item.textureUrl),
		resultUrl: normalizeString(item.resultUrl),
		backgroundUrl: normalizeString(item.backgroundUrl),
		textureUrl: normalizeString(item.textureUrl),
		timeText: formatTimestamp(item.createTime),
		createTime: Number(item.createTime || 0)
	};
}

export function createWorkStatusTabs(list = []) {
	const counters = {
		all: list.length,
		processing: 0,
		success: 0,
		fail: 0
	};
	list.forEach((item) => {
		const key = normalizeString(item.status);
		if (Object.prototype.hasOwnProperty.call(counters, key)) {
			counters[key] += 1;
		}
	});
	return [
		{ key: 'all', label: '全部', count: counters.all },
		{ key: 'processing', label: '生成中', count: counters.processing },
		{ key: 'success', label: '成功', count: counters.success },
		{ key: 'fail', label: '失败', count: counters.fail }
	];
}

export function filterWorksByStatus(list = [], status = 'all') {
	const normalizedStatus = normalizeString(status) || 'all';
	if (normalizedStatus === 'all') {
		return list;
	}
	return list.filter((item) => normalizeString(item.status) === normalizedStatus);
}

export function createShowroomCategories(list = []) {
	const categories = [
		{ key: 'all', label: '全部' }
	];
	const usedKeys = {
		all: true
	};
	list.forEach((item) => {
		const key = normalizeString(item.categoryKey);
		const label = normalizeString(item.categoryName);
		if (!key || !label || usedKeys[key]) {
			return;
		}
		usedKeys[key] = true;
		categories.push({
			key,
			label
		});
	});
	return categories;
}

export function buildRenderHomeViewModel({
	hasLogin = false,
	balance = 0,
	generating = false,
	canGenerate = false,
	pointSummaryLoading = false,
	pointSummaryError = ''
} = {}) {
	const normalizedError = normalizeString(pointSummaryError);
	const shouldShowPendingPoints = hasLogin && (pointSummaryLoading || normalizedError);
	const pointsText = shouldShowPendingPoints
		? '当前可用点数：--'
		: `当前可用点数：${Number(balance || 0)} 点`;
	const loginHintText = hasLogin
		? (normalizedError ? `点数同步失败：${normalizedError}` : (pointSummaryLoading ? '点数同步中...' : '已登录，可开始智能渲染'))
		: '未登录，生成前请先登录';
	return {
		brandText: '帝想AI',
		greetingText: '你好，盛泰窗帘厂',
		pointsText,
		loginHintText,
		submitText: generating ? '生成中...' : '立即生成（消耗 1 点）',
		submitDisabled: generating || !canGenerate
	};
}

export default {
	normalizeWorkRecord,
	createWorkStatusTabs,
	filterWorksByStatus,
	createShowroomCategories,
	buildRenderHomeViewModel
};
