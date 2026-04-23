'use strict';

const uniID = require('uni-id');
const db = uniCloud.database();
const collection = db.collection('curtain_preview_record');

const DEFAULT_PAGE_NO = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 20;
const HISTORY_FIELDS = {
	backgroundFileId: true,
	backgroundUrl: true,
	textureFileId: true,
	textureUrl: true,
	resultFileId: true,
	resultUrl: true,
	prompt: true,
	model: true,
	status: true,
	errorMessage: true,
	createTime: true,
	updateTime: true
};

function normalizeString(value) {
	return typeof value === 'string' ? value.trim() : '';
}

function normalizeInteger(value, defaultValue) {
	const parsed = Number.parseInt(value, 10);
	return Number.isNaN(parsed) ? defaultValue : parsed;
}

function getPagination(event) {
	const rawPageNo = normalizeInteger(event.pageNo, DEFAULT_PAGE_NO);
	const rawPageSize = normalizeInteger(event.pageSize, DEFAULT_PAGE_SIZE);
	const pageNo = Math.max(rawPageNo, 1);
	const pageSize = Math.min(Math.max(rawPageSize, 1), MAX_PAGE_SIZE);

	return {
		pageNo,
		pageSize,
		skip: (pageNo - 1) * pageSize
	};
}

async function getCurrentUser(event) {
	if (!event || !event.uniIdToken) {
		return {
			success: false,
			message: '请先登录后再查看历史记录',
			list: [],
			total: 0
		};
	}
	try {
		const payload = await uniID.checkToken(event.uniIdToken);
		if (payload.code && payload.code > 0) {
			return {
				success: false,
				message: '登录状态已失效，请重新登录',
				list: [],
				total: 0
			};
		}
		return {
			success: true,
			uid: payload.uid
		};
	} catch (error) {
		return {
			success: false,
			message: '登录状态已失效，请重新登录',
			list: [],
			total: 0
		};
	}
}

function pickTempUrlItem(result, fileId) {
	if (!result) {
		return null;
	}
	if (Array.isArray(result)) {
		return result.find((item) => item.fileID === fileId || item.fileId === fileId) || null;
	}
	if (Array.isArray(result.fileList)) {
		return result.fileList.find((item) => item.fileID === fileId || item.fileId === fileId) || null;
	}
	if (Array.isArray(result.tempFileURL)) {
		return result.tempFileURL.find((item) => item.fileID === fileId || item.fileId === fileId) || null;
	}
	return null;
}

function extractTempUrl(item) {
	if (!item) {
		return '';
	}
	return normalizeString(item.tempFileURL || item.tempFileUrl || item.download_url || item.url);
}

async function refreshHistoryTempUrls(list) {
	if (!Array.isArray(list) || list.length === 0) {
		return [];
	}

	const fileIds = [];
	list.forEach((item) => {
		[item.backgroundFileId, item.textureFileId, item.resultFileId].forEach((fileId) => {
			const normalizedFileId = normalizeString(fileId);
			if (normalizedFileId && !fileIds.includes(normalizedFileId)) {
				fileIds.push(normalizedFileId);
			}
		});
	});

	if (fileIds.length === 0) {
		return list;
	}

	let tempUrlResult;
	try {
		tempUrlResult = await uniCloud.getTempFileURL({
			fileList: fileIds
		});
	} catch (error) {
		console.error('刷新历史记录临时地址失败', error);
		return list.map((item) => ({
			...item,
			backgroundUrl: normalizeString(item.backgroundFileId) ? '' : normalizeString(item.backgroundUrl),
			textureUrl: normalizeString(item.textureFileId) ? '' : normalizeString(item.textureUrl),
			resultUrl: normalizeString(item.resultFileId) ? '' : normalizeString(item.resultUrl)
		}));
	}

	return list.map((item) => ({
		...item,
		backgroundUrl: extractTempUrl(pickTempUrlItem(tempUrlResult, normalizeString(item.backgroundFileId))) || '',
		textureUrl: extractTempUrl(pickTempUrlItem(tempUrlResult, normalizeString(item.textureFileId))) || '',
		resultUrl: extractTempUrl(pickTempUrlItem(tempUrlResult, normalizeString(item.resultFileId))) || ''
	}));
}

exports.main = async (event) => {
	const { pageNo, pageSize, skip } = getPagination(event || {});
	const auth = await getCurrentUser(event || {});
	if (!auth.success) {
		return {
			...auth,
			pageNo,
			pageSize
		};
	}
	const query = collection.where({
		uid: auth.uid
	});
	const countResult = await query.count();
	const listResult = await collection
		.where({
			uid: auth.uid
		})
		.field(HISTORY_FIELDS)
		.orderBy('createTime', 'desc')
		.skip(skip)
		.limit(pageSize)
		.get();
	const refreshedList = await refreshHistoryTempUrls(Array.isArray(listResult.data) ? listResult.data : []);

	return {
		success: true,
		list: refreshedList,
		total: countResult.total || 0,
		pageNo,
		pageSize
	};
};
