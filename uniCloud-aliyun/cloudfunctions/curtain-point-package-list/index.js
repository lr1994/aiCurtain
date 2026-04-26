'use strict';

const defaultPackages = require('../../../common/curtain-app/default-packages');

const db = uniCloud.database();
const collection = db.collection('curtain_point_package');

function normalizeString(value) {
	return typeof value === 'string' ? value.trim() : '';
}

function normalizePackage(item = {}) {
	return {
		_id: normalizeString(item._id),
		title: normalizeString(item.title),
		priceFen: Number(item.priceFen || 0),
		points: Number(item.points || 0),
		bonusPoints: Number(item.bonusPoints || 0),
		sort: Number(item.sort || 0),
		status: item.status !== false
	};
}

function getDefaultPackages() {
	return defaultPackages.map((item) => normalizePackage(item)).sort((left, right) => left.sort - right.sort);
}

exports.main = async () => {
	const dbList = await collection
		.where({
			status: true
		})
		.orderBy('sort', 'asc')
		.get();
	const normalizedList = Array.isArray(dbList.data) ? dbList.data.map((item) => normalizePackage(item)) : [];

	return {
		success: true,
		list: normalizedList.length > 0 ? normalizedList : getDefaultPackages()
	};
};
