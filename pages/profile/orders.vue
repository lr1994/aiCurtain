<template>
	<view class="page">
		<view class="hero-card">
			<view class="page-title">订单记录</view>
			<view class="page-desc">这里展示套餐下单、支付状态和到账点数。</view>
		</view>

		<view v-if="!hasLogin" class="empty-card">
			<text class="empty-title">登录后可查看自己的订单记录</text>
			<button class="login-btn" size="mini" @click="goLogin">去登录</button>
		</view>

		<view v-else class="panel-card">
			<view class="panel-head">
				<text class="panel-title">最近订单</text>
				<text class="panel-refresh" @click="loadOrders">刷新</text>
			</view>

			<view v-if="loading" class="empty-card empty-card--inner">
				<text class="empty-title">订单加载中...</text>
			</view>
			<view v-else-if="orders.length === 0" class="empty-card empty-card--inner">
				<text class="empty-title">还没有充值订单</text>
			</view>
			<view v-else class="order-list">
				<view v-for="item in orders" :key="item._id" class="order-card">
					<view class="order-top">
						<text class="order-title">{{ item.packageTitle || '点数套餐' }}</text>
						<text class="order-status" :class="`order-status--${item.status}`">{{ formatStatus(item.status) }}</text>
					</view>
					<view class="order-line">订单号：{{ item.orderNo }}</view>
					<view class="order-line">金额：¥{{ formatPrice(item.amountFen) }}</view>
					<view class="order-line">到账：{{ item.points }} 点</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'ProfileOrdersPage',
	data() {
		return {
			hasLogin: false,
			loading: false,
			orders: []
		};
	},
	onShow() {
		this.syncLoginState();
		if (!this.hasLogin) {
			this.orders = [];
			return;
		}
		this.loadOrders();
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
			const redirectUrl = encodeURIComponent('/pages/profile/orders');
			uni.navigateTo({
				url: `/uni_modules/uni-id-pages/pages/login/login-withoutpwd?uniIdRedirectUrl=${redirectUrl}`
			});
		},
		formatPrice(priceFen) {
			return (Number(priceFen || 0) / 100).toFixed(2);
		},
		formatStatus(status) {
			if (status === 'success') {
				return '已支付';
			}
			if (status === 'fail') {
				return '支付失败';
			}
			return '待支付';
		},
		async loadOrders() {
			this.loading = true;
			try {
				const res = await uniCloud.callFunction({
					name: 'curtain-pay-order-list',
					data: {
						pageNo: 1,
						pageSize: 20
					}
				});
				const result = res.result || {};
				if (!result.success) {
					throw new Error(result.message || '订单加载失败');
				}
				this.orders = Array.isArray(result.list) ? result.list : [];
			} catch (error) {
				this.orders = [];
				uni.showToast({
					title: error.message || '订单加载失败',
					icon: 'none'
				});
			} finally {
				this.loading = false;
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
.panel-card,
.empty-card {
	border-radius: 28rpx;
	background: rgba(255, 255, 255, 0.94);
	box-shadow: 0 18rpx 40rpx rgba(65, 51, 38, 0.08);
}

.hero-card,
.panel-card {
	padding: 32rpx;
}

.empty-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 24rpx;
	padding: 28rpx 24rpx;
}

.empty-card--inner {
	margin-top: 0;
	padding: 24rpx 0;
	background: transparent;
	box-shadow: none;
}

.empty-title {
	color: #6f655b;
	font-size: 26rpx;
}

.login-btn {
	margin: 0;
	border-radius: 999rpx;
	background: #9d6b3d;
	color: #fff8f0;
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

.panel-refresh {
	color: #9d6b3d;
	font-size: 24rpx;
}

.order-list {
	margin-top: 24rpx;
}

.order-card {
	margin-bottom: 20rpx;
	padding: 24rpx;
	border-radius: 24rpx;
	background: #f7f2eb;
}

.order-top {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.order-title {
	color: #2f241a;
	font-size: 30rpx;
	font-weight: 600;
}

.order-status {
	padding: 8rpx 16rpx;
	border-radius: 999rpx;
	font-size: 22rpx;
}

.order-status--success {
	background: #e7f4ea;
	color: #2d7d46;
}

.order-status--fail {
	background: #fdeceb;
	color: #bc534e;
}

.order-status--init {
	background: #eef3fb;
	color: #476d9b;
}

.order-line {
	margin-top: 12rpx;
	color: #65584a;
	font-size: 25rpx;
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
</style>
