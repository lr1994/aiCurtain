<template>
	<view class="page">
		<view class="page-title">点数流水</view>
		<view class="page-desc">这里会展示充值、消费和人工补点记录。</view>
	</view>
</template>

<script>
export default {
	name: 'ProfilePointsPage'
};
</script>

<style scoped>
.page {
	min-height: 100vh;
	padding: 32rpx 24rpx;
	background: #f6f3ed;
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
