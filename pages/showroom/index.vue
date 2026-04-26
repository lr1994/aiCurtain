<template>
	<view class="page">
		<view class="page-head">
			<view>
				<view class="page-title">经典样板间</view>
				<view class="page-desc">先选一个接近真实场景的空间，再回到智能渲染继续生成。</view>
			</view>
			<text class="page-refresh" @click="loadScenes">刷新</text>
		</view>

		<view class="category-row">
			<view
				v-for="item in categories"
				:key="item.key"
				class="category-chip"
				:class="activeCategory === item.key ? 'category-chip--active' : ''"
				@click="activeCategory = item.key"
			>
				{{ item.label }}
			</view>
		</view>

		<view class="source-bar">
			<text>{{ sourceText }}</text>
			<text v-if="loading">加载中...</text>
		</view>

		<view v-if="visibleScenes.length === 0 && !loading" class="empty-card">
			<text class="empty-title">当前分类下还没有样板间</text>
		</view>

		<view v-else class="scene-list">
			<view
				v-for="scene in visibleScenes"
				:key="scene._id"
				class="scene-card"
				@click="handleSelectScene(scene)"
			>
				<view class="scene-cover">{{ scene.categoryName }}</view>
				<view class="scene-body">
					<view class="scene-title">{{ scene.title }}</view>
					<view class="scene-tags">
						<text v-for="tag in scene.tags" :key="tag" class="scene-tag">{{ tag }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import scenes from '../../common/curtain-app/frontend/default-scenes.js';
import renderSession from '../../common/curtain-app/frontend/render-session.js';
import pageModels from '../../common/curtain-app/frontend/page-models.js';

const { saveSceneSelection } = renderSession;
const { createShowroomCategories } = pageModels;

export default {
	name: 'ShowroomIndexPage',
	data() {
		return {
			loading: false,
			sourceText: '当前使用默认目录',
			activeCategory: 'all',
			allScenes: scenes,
			categories: createShowroomCategories(scenes)
		};
	},
	computed: {
		visibleScenes() {
			if (this.activeCategory === 'all') {
				return this.allScenes;
			}
			return this.allScenes.filter((item) => item.categoryKey === this.activeCategory);
		}
	},
	onShow() {
		this.loadScenes();
	},
	methods: {
		async loadScenes() {
			this.loading = true;
			try {
				const res = await uniCloud.callFunction({
					name: 'curtain-scene-list',
					data: {
						categoryKey: 'all'
					}
				});
				const result = res.result || {};
				if (!result.success) {
					throw new Error(result.message || '样板间加载失败');
				}
				const list = Array.isArray(result.list) && result.list.length > 0 ? result.list : scenes;
				this.allScenes = list;
				this.categories = createShowroomCategories(list);
				this.sourceText = result.source === 'cloud' ? '当前使用云端目录' : '当前使用项目默认目录';
			} catch (error) {
				this.allScenes = scenes;
				this.categories = createShowroomCategories(scenes);
				this.sourceText = '云端目录加载失败，已切回默认目录';
				uni.showToast({
					title: error.message || '样板间加载失败',
					icon: 'none'
				});
			} finally {
				this.loading = false;
			}
		},
		handleSelectScene(scene) {
			saveSceneSelection({
				sceneTemplateId: scene._id,
				sceneTitle: scene.title,
				backgroundFileId: scene.backgroundFileId,
				backgroundImage: scene.backgroundImage,
				defaultConfig: scene.defaultConfig
			});
			uni.switchTab({
				url: '/pages/render/index'
			});
		}
	}
};
</script>

<style scoped>
.page {
	min-height: 100vh;
	padding: 32rpx 24rpx 48rpx;
	background: linear-gradient(180deg, #f2f4ef 0%, #f7f2ea 100%);
}

.page-title {
	color: #243024;
	font-size: 48rpx;
	font-weight: 600;
}

.page-head {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
}

.page-desc {
	margin-top: 14rpx;
	color: #5c6a5c;
	font-size: 26rpx;
	line-height: 1.6;
}

.page-refresh {
	color: #8a633d;
	font-size: 24rpx;
}

.category-row {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
	margin-top: 26rpx;
}

.category-chip {
	padding: 12rpx 22rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.88);
	color: #6a5f53;
	font-size: 24rpx;
}

.category-chip--active {
	background: #243024;
	color: #f3f7f2;
}

.source-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 20rpx;
	color: #7a6d60;
	font-size: 24rpx;
}

.scene-list {
	margin-top: 28rpx;
}

.scene-card {
	display: flex;
	margin-bottom: 20rpx;
	border-radius: 28rpx;
	overflow: hidden;
	background: rgba(255, 255, 255, 0.92);
	box-shadow: 0 18rpx 40rpx rgba(36, 48, 36, 0.08);
}

.scene-cover {
	width: 180rpx;
	min-height: 200rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(160deg, #d2c0ae 0%, #b88858 100%);
	color: #fff7ef;
	font-size: 30rpx;
	font-weight: 600;
}

.scene-body {
	flex: 1;
	padding: 28rpx 24rpx;
}

.scene-title {
	color: #2f241a;
	font-size: 32rpx;
	font-weight: 600;
}

.scene-tags {
	display: flex;
	flex-wrap: wrap;
	margin-top: 18rpx;
}

.scene-tag {
	margin: 0 14rpx 14rpx 0;
	padding: 8rpx 18rpx;
	border-radius: 999rpx;
	background: #f4ede5;
	color: #8a6e54;
	font-size: 22rpx;
}

.empty-card {
	margin-top: 28rpx;
	padding: 30rpx;
	border-radius: 24rpx;
	background: rgba(255, 255, 255, 0.92);
}

.empty-title {
	color: #6f655b;
	font-size: 26rpx;
}
</style>
