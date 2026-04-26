<template>
	<view class="page">
		<view class="profile-card">
			<view class="profile-label">ACCOUNT CENTER</view>
			<view class="profile-title">个人中心</view>
			<view class="profile-balance">
				<text class="balance-label">当前点数</text>
				<text class="balance-value">{{ summary.balance }}</text>
			</view>
			<view class="profile-meta">
				<view class="meta-item">
					<text class="meta-label">累计充值</text>
					<text class="meta-value">{{ summary.totalRecharge }}</text>
				</view>
				<view class="meta-item">
					<text class="meta-label">累计消耗</text>
					<text class="meta-value">{{ summary.totalConsume }}</text>
				</view>
			</view>
			<view v-if="!hasLogin" class="profile-login-tip">
				<text>登录后可同步你的点数账户和作品数据</text>
				<button class="login-btn" size="mini" @click="goLogin">去登录</button>
			</view>
		</view>

		<view class="entry-list">
			<view class="entry-item" @click="goPage('/pages/profile/points')">
				<text>点数流水</text>
				<text>查看</text>
			</view>
			<view class="entry-item" @click="goPage('/pages/profile/orders')">
				<text>订单记录</text>
				<text>查看</text>
			</view>
			<view class="entry-item" @click="goPage('/pages/profile/recharge')">
				<text>充值中心</text>
				<text>前往</text>
			</view>
		</view>
	</view>
</template>

<script>
import pointSummaryModels from '@/common/curtain-app/frontend/point-summary.js';

const {
	createEmptyPointSummary,
	normalizePointSummary
} = pointSummaryModels;

export default {
	name: 'ProfileIndexPage',
	data() {
		return {
			hasLogin: false,
			summary: createEmptyPointSummary()
		};
	},
	onShow() {
		this.syncLoginState();
		if (!this.hasLogin) {
			this.summary = createEmptyPointSummary();
			return;
		}
		this.loadPointSummary();
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
			const redirectUrl = encodeURIComponent('/pages/profile/index');
			uni.navigateTo({
				url: `/uni_modules/uni-id-pages/pages/login/login-withoutpwd?uniIdRedirectUrl=${redirectUrl}`
			});
		},
		async loadPointSummary() {
			try {
				const res = await uniCloud.callFunction({
					name: 'curtain-point-summary',
					data: {}
				});
				const result = res.result || {};
				if (!result.success) {
					uni.showToast({
						title: result.message || '点数账户加载失败',
						icon: 'none'
					});
					return;
				}
				this.summary = normalizePointSummary(result);
			} catch (error) {
				this.summary = createEmptyPointSummary();
				uni.showToast({
					title: this.normalizeString(error && error.message) || '点数账户加载失败',
					icon: 'none'
				});
			}
		},
		goPage(url) {
			if (!this.hasLogin) {
				this.goLogin();
				return;
			}
			uni.navigateTo({
				url
			});
		}
	}
};
</script>

<style scoped>
.page {
	min-height: 100vh;
	padding: 32rpx 24rpx 48rpx;
	background: linear-gradient(180deg, #f1efe9 0%, #f6f3ed 100%);
}

.profile-card {
	padding: 34rpx 32rpx;
	border-radius: 30rpx;
	background: linear-gradient(145deg, #29333f 0%, #576679 100%);
	color: #f7f4ef;
}

.profile-label {
	font-size: 20rpx;
	letter-spacing: 3rpx;
	opacity: 0.78;
}

.profile-title {
	margin-top: 20rpx;
	font-size: 48rpx;
	font-weight: 600;
}

.profile-balance {
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	margin-top: 32rpx;
}

.profile-meta {
	display: flex;
	gap: 20rpx;
	margin-top: 28rpx;
}

.meta-item {
	flex: 1;
	padding: 20rpx 22rpx;
	border-radius: 20rpx;
	background: rgba(255, 255, 255, 0.12);
}

.meta-label {
	display: block;
	font-size: 22rpx;
	opacity: 0.76;
}

.meta-value {
	display: block;
	margin-top: 10rpx;
	font-size: 34rpx;
	font-weight: 600;
}

.balance-label {
	font-size: 26rpx;
	opacity: 0.82;
}

.balance-value {
	font-size: 72rpx;
	font-weight: 600;
	line-height: 1;
}

.profile-login-tip {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 26rpx;
	padding: 18rpx 20rpx;
	border-radius: 20rpx;
	background: rgba(255, 255, 255, 0.12);
	font-size: 22rpx;
}

.login-btn {
	margin: 0;
	border-radius: 999rpx;
	background: #f3e2cf;
	color: #463526;
}

.entry-list {
	margin-top: 24rpx;
	border-radius: 28rpx;
	overflow: hidden;
	background: rgba(255, 255, 255, 0.94);
}

.entry-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 28rpx 26rpx;
	color: #2f241a;
	font-size: 28rpx;
	border-bottom: 1px solid #efe7df;
}

.entry-item:last-child {
	border-bottom: 0;
}
</style>
