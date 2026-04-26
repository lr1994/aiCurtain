<template>
	<view class="page">
		<view class="hero-card">
			<view class="page-title">我的作品</view>
			<view class="page-desc">这里会沉淀你的生成记录，当前已支持状态筛选、预览和回到渲染页继续处理。</view>
		</view>

		<view v-if="!hasLogin" class="empty-card">
			<text class="empty-title">登录后可查看自己的作品记录</text>
			<button class="login-btn" size="mini" @click="goLogin">去登录</button>
		</view>

		<view v-else class="status-row">
			<view
				v-for="item in statusList"
				:key="item.key"
				class="status-chip"
				:class="activeStatus === item.key ? 'status-chip--active' : ''"
				@click="activeStatus = item.key"
			>
				<text class="status-name">{{ item.label }}</text>
				<text class="status-count">{{ item.count }}</text>
			</view>
		</view>

		<view v-if="hasLogin" class="panel-card">
			<view class="panel-head">
				<text class="panel-title">作品列表</text>
				<text class="panel-refresh" @click="loadWorks">刷新</text>
			</view>

			<view v-if="loading" class="empty-card empty-card--inner">
				<text class="empty-title">作品加载中...</text>
			</view>
			<view v-else-if="filteredWorks.length === 0" class="empty-card empty-card--inner">
				<text class="empty-title">当前筛选下还没有作品</text>
			</view>
			<view v-else class="works-list">
				<view v-for="item in filteredWorks" :key="item._id" class="work-card">
					<image v-if="item.coverUrl" :src="item.coverUrl" mode="aspectFill" class="work-cover" />
					<view v-else class="work-cover work-cover--placeholder">NO IMAGE</view>
					<view class="work-body">
						<view class="work-top">
							<text class="work-status" :class="`work-status--${item.statusTone}`">{{ item.statusLabel }}</text>
							<text class="work-time">{{ item.timeText || '刚刚生成' }}</text>
						</view>
						<view class="work-prompt">{{ item.promptText }}</view>
						<view v-if="item.errorMessage" class="work-error">{{ item.errorMessage }}</view>
						<view class="work-actions">
							<text class="work-action" @click="openResult(item)">详情</text>
							<text class="work-action" @click="previewWork(item)">预览</text>
							<text class="work-action" @click="reuseWork(item)">继续渲染</text>
							<text class="work-action work-action--danger" @click="deleteWork(item)">删除</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import renderSession from '../../common/curtain-app/frontend/render-session.js';
import pageModels from '../../common/curtain-app/frontend/page-models.js';

const { saveSceneSelection, saveRenderResult } = renderSession;
const {
	normalizeWorkRecord,
	createWorkStatusTabs,
	filterWorksByStatus
} = pageModels;

export default {
	name: 'WorksIndexPage',
	data() {
		return {
			hasLogin: false,
			loading: false,
			activeStatus: 'all',
			allWorks: [],
			statusList: createWorkStatusTabs([])
		};
	},
	computed: {
		filteredWorks() {
			return filterWorksByStatus(this.allWorks, this.activeStatus);
		}
	},
	onShow() {
		this.syncLoginState();
		if (!this.hasLogin) {
			this.allWorks = [];
			this.statusList = createWorkStatusTabs([]);
			return;
		}
		this.loadWorks();
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
			const redirectUrl = encodeURIComponent('/pages/works/index');
			uni.navigateTo({
				url: `/uni_modules/uni-id-pages/pages/login/login-withoutpwd?uniIdRedirectUrl=${redirectUrl}`
			});
		},
		async loadWorks() {
			if (!this.hasLogin) {
				return;
			}
			this.loading = true;
			try {
				const res = await uniCloud.callFunction({
					name: 'curtain-preview-history',
					data: {
						pageNo: 1,
						pageSize: 20
					}
				});
				const result = res.result || {};
				if (!result.success) {
					throw new Error(result.message || '作品加载失败');
				}
				const list = Array.isArray(result.list) ? result.list.map((item) => normalizeWorkRecord(item)) : [];
				this.allWorks = list;
				this.statusList = createWorkStatusTabs(list);
			} catch (error) {
				this.allWorks = [];
				this.statusList = createWorkStatusTabs([]);
				uni.showToast({
					title: error.message || '作品加载失败',
					icon: 'none'
				});
			} finally {
				this.loading = false;
			}
		},
		previewWork(item) {
			const urls = [item.resultUrl, item.coverUrl, item.backgroundUrl, item.textureUrl].filter(Boolean);
			if (urls.length === 0) {
				uni.showToast({
					title: '当前作品还没有可预览图片',
					icon: 'none'
				});
				return;
			}
			uni.previewImage({
				current: urls[0],
				urls
			});
		},
		openResult(item) {
			saveRenderResult({
				recordId: item._id,
				status: item.status,
				prompt: item.prompt || item.promptText,
				model: item.model,
				errorMessage: item.errorMessage,
				backgroundUrl: item.backgroundUrl,
				textureUrl: item.textureUrl,
				resultUrl: item.resultUrl,
				coverUrl: item.coverUrl,
				timeText: item.timeText,
				createTime: item.createTime
			});
			uni.navigateTo({
				url: '/pages/render/result'
			});
		},
		reuseWork(item) {
			saveSceneSelection({
				sceneTemplateId: '',
				sceneTitle: '来自我的作品',
				backgroundImage: item.backgroundUrl || item.coverUrl,
				textureImage: item.textureUrl,
				prompt: item.prompt || item.promptText,
				model: item.model,
				defaultConfig: {}
			});
			uni.switchTab({
				url: '/pages/render/index'
			});
		},
		async deleteWork(item) {
			const modalResult = await new Promise((resolve) => {
				uni.showModal({
					title: '删除作品',
					content: '删除后不可恢复，确认继续吗？',
					success: resolve
				});
			});
			if (!modalResult.confirm) {
				return;
			}
			try {
				const res = await uniCloud.callFunction({
					name: 'curtain-work-delete',
					data: {
						recordId: item._id
					}
				});
				const result = res.result || {};
				if (!result.success) {
					throw new Error(result.message || '删除失败');
				}
				uni.showToast({
					title: '作品已删除',
					icon: 'success'
				});
				await this.loadWorks();
			} catch (error) {
				uni.showToast({
					title: error.message || '删除失败',
					icon: 'none'
				});
			}
		}
	}
};
</script>

<style scoped>
.page {
	min-height: 100vh;
	padding: 32rpx 24rpx 48rpx;
	background: linear-gradient(180deg, #f5f0eb 0%, #f4f6f8 100%);
}

.hero-card {
	padding: 32rpx;
	border-radius: 28rpx;
	background: rgba(255, 255, 255, 0.92);
	box-shadow: 0 18rpx 40rpx rgba(51, 40, 30, 0.08);
}

.panel-card {
	margin-top: 24rpx;
	padding: 30rpx;
	border-radius: 28rpx;
	background: rgba(255, 255, 255, 0.92);
	box-shadow: 0 18rpx 40rpx rgba(51, 40, 30, 0.08);
}

.page-title {
	color: #30251a;
	font-size: 48rpx;
	font-weight: 600;
}

.page-desc {
	margin-top: 14rpx;
	color: #786a5d;
	font-size: 26rpx;
	line-height: 1.6;
}

.status-row {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 20rpx;
	margin-top: 24rpx;
}

.status-chip {
	padding: 28rpx 24rpx;
	border-radius: 24rpx;
	background: rgba(255, 255, 255, 0.92);
	border: 2rpx solid transparent;
}

.status-chip--active {
	border-color: #9d6b3d;
	background: #f8f1e8;
}

.status-name {
	display: block;
	color: #8c7a69;
	font-size: 24rpx;
}

.status-count {
	display: block;
	margin-top: 12rpx;
	color: #2d2319;
	font-size: 38rpx;
	font-weight: 600;
}

.empty-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 24rpx;
	padding: 28rpx 26rpx;
	border-radius: 24rpx;
	background: rgba(255, 255, 255, 0.92);
}

.empty-card--inner {
	margin-top: 0;
	padding: 32rpx 0;
	background: transparent;
}

.empty-title {
	color: #786a5d;
	font-size: 26rpx;
}

.login-btn {
	margin: 0;
	border-radius: 999rpx;
	background: #9d6b3d;
	color: #fff8f0;
}

.panel-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.panel-title {
	color: #30251a;
	font-size: 32rpx;
	font-weight: 600;
}

.panel-refresh {
	color: #9d6b3d;
	font-size: 24rpx;
}

.works-list {
	margin-top: 24rpx;
}

.work-card {
	display: flex;
	margin-bottom: 20rpx;
	border-radius: 24rpx;
	overflow: hidden;
	background: #f9f5ef;
}

.work-cover {
	width: 210rpx;
	height: 210rpx;
	background: #ded4c9;
}

.work-cover--placeholder {
	display: flex;
	align-items: center;
	justify-content: center;
	color: #8a7d70;
	font-size: 24rpx;
}

.work-body {
	flex: 1;
	padding: 22rpx 22rpx 20rpx;
}

.work-top {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.work-status {
	padding: 8rpx 16rpx;
	border-radius: 999rpx;
	font-size: 22rpx;
}

.work-status--success {
	background: #e7f4ea;
	color: #2d7d46;
}

.work-status--processing {
	background: #eef3fb;
	color: #476d9b;
}

.work-status--fail {
	background: #fdeceb;
	color: #bc534e;
}

.work-time {
	color: #8c7a69;
	font-size: 22rpx;
}

.work-prompt {
	margin-top: 16rpx;
	color: #2d2319;
	font-size: 28rpx;
	line-height: 1.5;
}

.work-error {
	margin-top: 12rpx;
	color: #bc534e;
	font-size: 22rpx;
}

.work-actions {
	display: flex;
	gap: 28rpx;
	margin-top: 18rpx;
}

.work-action {
	color: #9d6b3d;
	font-size: 24rpx;
}

.work-action--danger {
	color: #bc534e;
}
</style>
