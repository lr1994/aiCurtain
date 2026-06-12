'use strict';

const uniID = require('uni-id');
const defaultPackages = require('curtain-default-packages');
const { createMiniProgramOrder } = require('uni-pay-bridge');

const db = uniCloud.database();
const packageCollection = db.collection('curtain_point_package');
const orderCollection = db.collection('curtain_pay_order');
const userCollection = db.collection('uni-id-users');

function normalizeString(value) {
	return typeof value === 'string' ? value.trim() : '';
}

function buildFailResponse(message) {
	return {
		success: false,
		message
	};
}

async function getCurrentUser(event) {
	if (!event || !event.uniIdToken) {
		throw new Error('请先登录后再下单');
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

async function getCurrentUserProfile(uid) {
	const normalizedUid = normalizeString(uid);
	if (!normalizedUid) {
		return {};
	}
	const profileResult = await userCollection.doc(normalizedUid).get();
	if (profileResult && Array.isArray(profileResult.data) && profileResult.data.length > 0) {
		return profileResult.data[0] || {};
	}
	if (profileResult && profileResult.data && !Array.isArray(profileResult.data)) {
		return profileResult.data;
	}
	return {};
}

function resolveWeixinOpenid(value) {
    if (typeof value === 'string') {
        return normalizeString(value);
    }
    if (!value || typeof value !== 'object') {
        return '';
    }
    
    // 处理 uni-id 的新格式：wx_openid 是一个对象 { mp: "xxx", mp_wx...: "xxx" }
    // 优先获取 mp 字段（小程序通用）
    if (value.mp && typeof value.mp === 'string') {
        return normalizeString(value.mp);
    }
    
    // 尝试获取以 mp_ 开头的任意字段
    const mpKeys = Object.keys(value).filter(key => key === 'mp' || key.startsWith('mp_'));
    for (const key of mpKeys) {
        const matched = normalizeString(value[key]);
        if (matched) {
            return matched;
        }
    }
    
    // 原有的精确匹配逻辑
    const exactKeys = ['mp-weixin', 'mp', 'weixin-mp'];
    for (const key of exactKeys) {
        const matched = normalizeString(value[key]);
        if (matched) {
            return matched;
        }
    }
    
    // 模糊匹配
    const fuzzyKeys = Object.keys(value).filter((key) => /^mp([_-]|$)|^mp-weixin([_-]|$)|^weixin-mp([_-]|$)/.test(key));
    for (const key of fuzzyKeys) {
        const matched = normalizeString(value[key]);
        if (matched) {
            return matched;
        }
    }
    
    // 最后遍历所有字段，返回第一个非空字符串
    for (const key of Object.keys(value)) {
        const matched = normalizeString(value[key]);
        if (matched) {
            return matched;
        }
    }
    return '';
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

async function getActivePackage(packageId) {
	const normalizedPackageId = normalizeString(packageId);
	if (!normalizedPackageId) {
		throw new Error('请选择要购买的套餐');
	}

	const found = await packageCollection.where({
		_id: normalizedPackageId,
		status: true
	}).get();
	if (Array.isArray(found.data) && found.data.length > 0) {
		return normalizePackage(found.data[0]);
	}

	const fallback = defaultPackages
		.map((item) => normalizePackage(item))
		.find((item) => item._id === normalizedPackageId && item.status);
	if (fallback) {
		return fallback;
	}

	throw new Error('套餐不存在或已下架');
}

function buildOrderNo() {
	return `CP${Date.now()}${Math.random().toString().slice(2, 6)}`;
}

async function buildPaymentPayload({ auth, userProfile, pkg, orderNo }) {
	// const mode = normalizeString(process.env.CURTAIN_PAYMENT_MODE) || 'mock';
	const mode = 'real';
	console.log('auth',auth)
	console.log('userProfile',userProfile)
	if (mode === 'mock') {
		return {
			paymentParams: {
				mock: true,
				provider: 'wxpay',
				orderNo,
				amountFen: pkg.priceFen
			},
			payProvider: 'wxpay',
			payChannel: 'mp',
			thirdOrderNo: ''
		};
	}
	let openid = '';
    // 1. 从 auth.userInfo 中获取
    if (auth.userInfo) {
        const wxOpenid = auth.userInfo.wx_openid;
        
        // 处理 wx_openid 可能是对象的情况
        if (wxOpenid && typeof wxOpenid === 'object') {
            openid = wxOpenid.mp || 
                     wxOpenid['mp-weixin'] || 
                     Object.values(wxOpenid).find(v => typeof v === 'string' && v) || 
                     '';
        } else if (typeof wxOpenid === 'string') {
            openid = wxOpenid;
        }
        
        // 如果还没找到，尝试其他字段
        if (!openid) {
            openid = normalizeString(auth.userInfo.openid || auth.userInfo.mp_openid);
        }
    }
    
    // 2. 如果还没找到，尝试从 userProfile 获取
    if (!openid && userProfile) {
        const wxOpenid = userProfile.wx_openid;
        if (wxOpenid && typeof wxOpenid === 'object') {
            openid = wxOpenid.mp || 
                     wxOpenid['mp-weixin'] || 
                     Object.values(wxOpenid).find(v => typeof v === 'string' && v) || 
                     '';
        } else if (typeof wxOpenid === 'string') {
            openid = wxOpenid;
        }
        
        if (!openid) {
            openid = normalizeString(userProfile.openid || userProfile.mp_openid);
        }
    }
    
    // 3. 最后的回退方案：使用 resolveWeixinOpenid
    if (!openid) {
        openid = resolveWeixinOpenid(auth.wx_openid) || resolveWeixinOpenid(userProfile?.wx_openid);
    }
    
    console.log('最终获取到的 openid:', openid);
	if (!openid) {
		throw new Error('未获取到微信用户标识，请重新登录后再试');
	}
	const uniPay = uniCloud.importObject('uni-pay-co');
	const payRes = await createMiniProgramOrder({
		uniPay,
		orderNo,
		totalFee: pkg.priceFen,
		title: pkg.title,
		uid: auth.uid,
		openid
	});
	return {
		paymentParams: payRes,
		payProvider: 'wxpay',
		payChannel: 'mp',
		thirdOrderNo: ''
	};
}

exports.main = async (event) => {
	try {
		const auth = await getCurrentUser(event || {});
		console.log('auth', JSON.stringify(auth))
// console.log('userProfile', JSON.stringify(userProfile))

		const userProfile = await getCurrentUserProfile(auth.uid);
		const pkg = await getActivePackage(event && event.packageId);
		const orderNo = buildOrderNo();
		const points = pkg.points + pkg.bonusPoints;
		
		const orderResult = await orderCollection.add({
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
			thirdOrderNo: '',
			transactionId: '',
			failReason: ''
		});
		const paymentPayload = await buildPaymentPayload({
			auth,
			userProfile,
			pkg,
			orderNo
		});
		const thirdOrderNo = normalizeString(paymentPayload.paymentParams && paymentPayload.paymentParams.thirdOrderNo);
		await orderCollection.doc(orderResult.id).update({
			payProvider: paymentPayload.payProvider,
			payChannel: paymentPayload.payChannel,
			thirdOrderNo
		});

		return {
			success: true,
			orderNo,
			paymentParams: paymentPayload.paymentParams
		};
	} catch (error) {
		return buildFailResponse(error.message || '创建订单失败');
	}
};
