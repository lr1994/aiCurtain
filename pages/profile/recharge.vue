<template>
	<view class="page">
		<view class="hero-card">
			<view class="page-title">充值中心</view>
			<view class="page-desc">选择点数套餐后可直接拉起微信支付，支付结果以服务端到账状态为准。</view>
		</view>

		<view class="panel-card">
			<view class="panel-head">
				<text class="panel-title">点数套餐</text>
				<text class="panel-tip">{{ packages.length }} 个可选</text>
			</view>
			<view v-if="!hasLogin" class="empty-card">
				<text class="empty-title">登录后可查看并购买套餐</text>
				<button class="login-btn" size="mini" @click="goLogin">去登录</button>
			</view>
			<view v-else-if="loadingPackages" class="empty-card">
				<text class="empty-title">套餐加载中...</text>
			</view>
			<view v-else class="package-list">
				<view v-for="item in packages" :key="item._id" class="package-card">
					<view class="package-top">
						<text class="package-title">{{ item.title }}</text>
						<text class="package-price">¥{{ formatPrice(item.priceFen) }}</text>
					</view>
					<view class="package-points">到账 {{ item.points + item.bonusPoints }} 点</view>
					<view class="package-sub">{{ item.points }} 基础点 + {{ item.bonusPoints }} 赠送点</view>
					<button
						class="ghost-btn"
						size="mini"
						:loading="payingPackageId === item._id"
						:disabled="payingPackageId === item._id"
						@click="handlePackageClick(item)"
					>立即下单</button>
				</view>
			</view>
		</view>

		<view class="panel-card">
			<view class="panel-head">
				<text class="panel-title">人工补点申请</text>
				<text class="panel-tip">门店演示可先用</text>
			</view>
			<input v-model="form.contact" class="field-input" placeholder="请输入手机号或微信号" />
			<textarea
				v-model="form.remark"
				class="field-textarea"
				maxlength="200"
				placeholder="请输入申请说明，例如门店演示账号补点"
			/>
			<button class="primary-btn" :disabled="submitting || !hasLogin" :loading="submitting" @click="submitManualApply">
				{{ submitting ? '提交中...' : '提交补点申请' }}
			</button>
		</view>
	</view>
</template>

<script>
export default {
	name: 'ProfileRechargePage',
	data() {
		return {
			hasLogin: false,
			loadingPackages: false,
			payingPackageId: '',
			submitting: false,
			packages: [],
			form: {
				contact: '',
				remark: ''
			}
		};
	},
	onShow() {
		this.syncLoginState();
		if (this.hasLogin) {
			// 获取当前用户信息
			const userInfo = uniCloud.getCurrentUserInfo();
			console.log('当前用户信息:', userInfo);
			this.loadPackages();
		}
	},
	methods: {
		normalizeString(value) {
			return typeof value === 'string' ? value.trim() : '';
		},
		syncLoginState() {
			const currentUser = typeof uniCloud.getCurrentUserInfo === 'function' ? uniCloud.getCurrentUserInfo() : {};
			const tokenExpired = Number((currentUser && currentUser.tokenExpired) || 0);
			const uid = this.normalizeString(currentUser && currentUser.uid);
			this.hasLogin = !!uid && tokenExpired > Date.now();
		},
		goLogin() {
			const redirectUrl = encodeURIComponent('/pages/profile/recharge');
			uni.navigateTo({
				url: `/uni_modules/uni-id-pages/pages/login/login-withoutpwd?uniIdRedirectUrl=${redirectUrl}`
			});
		},
		formatPrice(priceFen) {
			return (Number(priceFen || 0) / 100).toFixed(2);
		},
		async loadPackages() {
			this.loadingPackages = true;
			try {
				const res = await uniCloud.callFunction({
					name: 'curtain-point-package-list',
					data: {}
				});
				const result = res.result || {};
				if (!result.success) {
					throw new Error(result.message || '套餐加载失败');
				}
				this.packages = Array.isArray(result.list) ? result.list : [];
			} catch (error) {
				uni.showToast({
					title: error.message || '套餐加载失败',
					icon: 'none'
				});
			} finally {
				this.loadingPackages = false;
			}
		},
		handlePackageClick(item) {
			if (!this.hasLogin) {
				this.goLogin();
				return;
			}
			this.createRechargeOrder(item);
		},
		async createRechargeOrder(item) {
			this.payingPackageId = item._id;
			console.log('item',item)
			try {
				const res = await uniCloud.callFunction({
					name: 'curtain-pay-order-create',
					data: {
						packageId: item._id
					}
				});
				const result = res.result || {};
				if (!result.success) {
					throw new Error(result.message || '创建订单失败');
				}
				await uni.requestPayment({
					provider: 'wxpay',
					...(result.paymentParams || {})
				});
				uni.showToast({
					title: '支付成功，正在同步到账结果',
					icon: 'none'
				});
				this.loadPackages();
			} catch (error) {
				const errorMessage = this.normalizeString(error && (error.errMsg || error.message));
				const isCancel = /cancel/i.test(errorMessage) || /取消/.test(errorMessage);
				uni.showToast({
					title: isCancel ? '已取消支付' : (errorMessage || '支付失败'),
					icon: 'none'
				});
			} finally {
				this.payingPackageId = '';
			}
		},
		async submitManualApply() {
			if (!this.hasLogin) {
				this.goLogin();
				return;
			}
			if (!this.normalizeString(this.form.contact)) {
				uni.showToast({
					title: '请填写联系方式',
					icon: 'none'
				});
				return;
			}
			this.submitting = true;
			try {
				const res = await uniCloud.callFunction({
					name: 'curtain-manual-recharge-apply-create',
					data: {
						contact: this.form.contact,
						remark: this.form.remark
					}
				});
				const result = res.result || {};
				if (!result.success) {
					throw new Error(result.message || '提交失败');
				}
				uni.showToast({
					title: '申请已提交',
					icon: 'success'
				});
				this.form = {
					contact: this.form.contact,
					remark: ''
				};
			} catch (error) {
				uni.showToast({
					title: error.message || '提交失败',
					icon: 'none'
				});
			} finally {
				this.submitting = false;
			}
		}
	}
};
</script>

<style scoped>
.page {
	min-height: 100vh;
	padding: 32rpx 24rpx 48rpx;
	background: linear-gradient(180deg, #f6f0e8 0%, #f2f4f7 100%);
}

.hero-card,
.panel-card {
	padding: 32rpx;
	border-radius: 28rpx;
	background: rgba(255, 255, 255, 0.94);
	box-shadow: 0 18rpx 40rpx rgba(65, 51, 38, 0.08);
}

.panel-card {
	margin-top: 24rpx;
}

.panel-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.panel-title {
	color: #2f241a;
	font-size: 32rpx;
	font-weight: 600;
}

.panel-tip {
	color: #8c7a69;
	font-size: 24rpx;
}

.empty-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 24rpx;
	padding: 22rpx 0;
}

.empty-title {
	color: #6f655b;
	font-size: 26rpx;
}

.package-list {
	margin-top: 24rpx;
}

.package-card {
	margin-bottom: 20rpx;
	padding: 24rpx;
	border-radius: 24rpx;
	background: #f7f2eb;
}

.package-top {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.package-title {
	color: #2f241a;
	font-size: 32rpx;
	font-weight: 600;
}

.package-price {
	color: #9d6b3d;
	font-size: 34rpx;
	font-weight: 600;
}

.package-points {
	margin-top: 16rpx;
	color: #2f241a;
	font-size: 28rpx;
	font-weight: 600;
}

.package-sub {
	margin-top: 10rpx;
	color: #7d6c5d;
	font-size: 24rpx;
}

.ghost-btn {
	margin: 22rpx 0 0;
	border-radius: 999rpx;
	background: #fff;
	color: #8a633d;
}

.field-input,
.field-textarea {
	width: 100%;
	box-sizing: border-box;
	margin-top: 24rpx;
	padding: 24rpx;
	border-radius: 22rpx;
	background: #f7f2eb;
	color: #2f241a;
	font-size: 28rpx;
}

.field-textarea {
	min-height: 220rpx;
}

.primary-btn,
.login-btn {
	border-radius: 999rpx;
}

.page-title {
	color: #2f241a;
	font-size: 44rpx;
	font-weight: 600;
}

.page-desc {
	margin-top: 16rpx;
	color: #7a6d60;
	font-size: 26rpx;
	line-height: 1.6;
}

.primary-btn {
	margin-top: 28rpx;
	background: #9d6b3d;
	color: #fff8f0;
}

.login-btn {
	margin: 0;
	background: #9d6b3d;
	color: #fff8f0;
}
</style>
