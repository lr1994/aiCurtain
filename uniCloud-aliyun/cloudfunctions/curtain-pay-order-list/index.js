'use strict';

const uniID = require('uni-id');

const db = uniCloud.database();
const orderCollection = db.collection('curtain_pay_order');

const DEFAULT_PAGE_NO = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 20;

function normalizeString(value) {
	return typeof value === 'string' ? value.trim() : '';
}

function normalizeInteger(value, defaultValue) {
	const parsed = Number.parseInt(value, 10);
	return Number.isNaN(parsed) ? defaultValue : parsed;
}

function buildFailResponse(message) {
	return {
		success: false,
		message,
		list: [],
		total: 0
	};
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
		throw new Error('请先登录后再查看订单记录');
	}
	try {
		const payload = await uniID.checkToken(event.uniIdToken);
		if (payload.code && payload.code > 0) {
			throw new Error('登录状态已失效，请重新登录');
		}
		return payload;
	} catch (error) {
		if (error && error.message) {
			throw error;
		}
		throw new Error('登录状态已失效，请重新登录');
	}
}

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
		createTime: Number(item.createTime || 0),
		payTime: item.payTime || null
	};
}

exports.main = async (event) => {
	try {
		const auth = await getCurrentUser(event || {});
		const { pageNo, pageSize, skip } = getPagination(event || {});
		const countResult = await orderCollection.where({
			uid: auth.uid
		}).count();
		const listResult = await orderCollection.where({
			uid: auth.uid
		}).orderBy('createTime', 'desc').skip(skip).limit(pageSize).get();

		return {
			success: true,
			list: Array.isArray(listResult.data) ? listResult.data.map((item) => normalizeOrder(item)) : [],
			total: countResult.total || 0,
			pageNo,
			pageSize
		};
	} catch (error) {
		return buildFailResponse(error.message || '获取订单记录失败');
	}
};
