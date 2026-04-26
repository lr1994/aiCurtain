<template>
	<view class="page">
		<view class="hero-card">
			<view class="hero-top">
				<view>
					<view class="page-title">渲染效果</view>
					<view class="page-desc">在这里查看效果图、背景图和材质图，也可以直接保存当前图片或继续渲染。</view>
				</view>
				<view v-if="detail.coverUrl" class="status-chip" :class="`status-chip--${detail.statusTone}`">{{ detail.statusLabel }}</view>
			</view>
			<view v-if="detail.timeText" class="meta-line">生成时间：{{ detail.timeText }}</view>
			<view v-if="detail.prompt" class="meta-line">提示词：{{ detail.prompt }}</view>
			<view v-if="detail.errorMessage" class="error-line">{{ detail.errorMessage }}</view>
		</view>

		<view v-if="!detail.coverUrl" class="empty-card">
			<view class="empty-title">当前没有可展示的渲染结果</view>
			<view class="empty-desc">请先从智能渲染页或我的作品页进入结果详情。</view>
			<button class="primary-btn" @click="goRender">去智能渲染</button>
		</view>

		<block v-else>
			<view class="segmented-row">
				<view
					v-for="item in tabList"
					:key="item.key"
					class="segmented-chip"
					:class="activeTab === item.key ? 'segmented-chip--active' : ''"
					@click="activeTab = item.key"
				>
					{{ item.label }}
				</view>
			</view>

			<view class="preview-card">
				<image :src="currentImage" mode="widthFix" class="preview-image" @click="previewCurrentImage" />
			</view>

			<view class="compare-grid">
				<view class="mini-card" @click="previewImage(detail.resultUrl)">
					<view class="mini-label">效果图</view>
					<image v-if="detail.resultUrl" :src="detail.resultUrl" mode="aspectFill" class="mini-image" />
					<view v-else class="mini-empty">暂无</view>
				</view>
				<view class="mini-card" @click="previewImage(detail.backgroundUrl)">
					<view class="mini-label">背景图</view>
					<image v-if="detail.backgroundUrl" :src="detail.backgroundUrl" mode="aspectFill" class="mini-image" />
					<view v-else class="mini-empty">暂无</view>
				</view>
				<view class="mini-card" @click="previewImage(detail.textureUrl)">
					<view class="mini-label">材质图</view>
					<image v-if="detail.textureUrl" :src="detail.textureUrl" mode="aspectFill" class="mini-image" />
					<view v-else class="mini-empty">暂无</view>
				</view>
			</view>

			<view class="action-grid">
				<button class="primary-btn" @click="saveCurrentImage">保存当前图片</button>
				<button class="ghost-btn" @click="continueRender">继续渲染</button>
				<button class="ghost-btn" @click="goWorks">查看作品</button>
			</view>
		</block>
	</view>
</template>

<script>
import renderSession from '../../common/curtain-app/frontend/render-session.js';
import pageModels from '../../common/curtain-app/frontend/page-models.js';

const { readRenderResult, saveSceneSelection } = renderSession;
const { normalizeWorkRecord } = pageModels;

export default {
	name: 'RenderResultPage',
	data() {
		return {
			activeTab: 'result',
			detail: normalizeWorkRecord({})
		};
	},
	computed: {
		tabList() {
			return [
				{ key: 'result', label: '效果图' },
				{ key: 'background', label: '背景图' },
				{ key: 'texture', label: '材质图' }
			];
		},
		currentImage() {
			if (this.activeTab === 'background') {
				return this.detail.backgroundUrl || this.detail.coverUrl;
			}
			if (this.activeTab === 'texture') {
				return this.detail.textureUrl || this.detail.coverUrl;
			}
			return this.detail.resultUrl || this.detail.coverUrl;
		}
	},
	onShow() {
		this.restoreDetail();
	},
	methods: {
		restoreDetail() {
			const saved = readRenderResult();
			this.detail = normalizeWorkRecord(saved || {});
			if (!this.detail.resultUrl && this.detail.backgroundUrl) {
				this.activeTab = 'background';
				return;
			}
			this.activeTab = 'result';
		},
		previewCurrentImage() {
			this.previewImage(this.currentImage);
		},
		previewImage(url) {
			if (!url) {
				uni.showToast({
					title: '当前图片暂不可预览',
					icon: 'none'
				});
				return;
			}
			uni.previewImage({
				current: url,
				urls: [url]
			});
		},
		saveCurrentImage() {
			if (!this.currentImage) {
				uni.showToast({
					title: '当前图片暂不可保存',
					icon: 'none'
				});
				return;
			}
			uni.getImageInfo({
				src: this.currentImage,
				success: (res) => {
					uni.saveImageToPhotosAlbum({
						filePath: res.path,
						success: () => {
							uni.showToast({
								title: '已保存到相册',
								icon: 'success'
							});
						},
						fail: () => {
							uni.showToast({
								title: '保存失败，请检查相册权限',
								icon: 'none'
							});
						}
					});
				},
				fail: () => {
					uni.showToast({
						title: '图片下载失败，暂时无法保存',
						icon: 'none'
					});
				}
			});
		},
		continueRender() {
			saveSceneSelection({
				sceneTemplateId: '',
				sceneTitle: '来自结果页',
				backgroundImage: this.detail.backgroundUrl || this.detail.coverUrl,
				textureImage: this.detail.textureUrl,
				prompt: this.detail.prompt || this.detail.promptText,
				model: this.detail.model,
				defaultConfig: {}
			});
			uni.switchTab({
				url: '/pages/render/index'
			});
		},
		goRender() {
			uni.switchTab({
				url: '/pages/render/index'
			});
		},
		goWorks() {
			uni.switchTab({
				url: '/pages/works/index'
			});
		}
	}
};
</script>

<style scoped>
.page {
	min-height: 100vh;
	padding: 32rpx 24rpx 48rpx;
	background: linear-gradient(180deg, #eef4f8 0%, #f7f3ec 100%);
}

.hero-card,
.preview-card,
.mini-card,
.empty-card {
	border-radius: 28rpx;
	background: rgba(255, 255, 255, 0.94);
	box-shadow: 0 18rpx 40rpx rgba(42, 55, 69, 0.08);
}

.hero-card {
	padding: 32rpx;
}

.hero-top {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 20rpx;
}

.page-title {
	color: #243242;
	font-size: 46rpx;
	font-weight: 600;
}

.page-desc {
	margin-top: 16rpx;
	color: #68788b;
	font-size: 26rpx;
	line-height: 1.6;
}

.status-chip {
	padding: 12rpx 18rpx;
	border-radius: 999rpx;
	font-size: 22rpx;
	white-space: nowrap;
}

.status-chip--success {
	background: #e7f4ea;
	color: #2d7d46;
}

.status-chip--processing {
	background: #eef3fb;
	color: #476d9b;
}

.status-chip--fail {
	background: #fdeceb;
	color: #bc534e;
}

.meta-line {
	margin-top: 16rpx;
	color: #5f6d7c;
	font-size: 24rpx;
	line-height: 1.6;
}

.error-line {
	margin-top: 14rpx;
	color: #bc534e;
	font-size: 24rpx;
	line-height: 1.6;
}

.empty-card {
	margin-top: 24rpx;
	padding: 36rpx 30rpx;
	text-align: center;
}

.empty-title {
	color: #334155;
	font-size: 30rpx;
	font-weight: 600;
}

.empty-desc {
	margin-top: 14rpx;
	color: #64748b;
	font-size: 24rpx;
	line-height: 1.6;
}

.segmented-row {
	display: flex;
	gap: 16rpx;
	margin-top: 24rpx;
}

.segmented-chip {
	flex: 1;
	padding: 18rpx 0;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.9);
	color: #64748b;
	font-size: 24rpx;
	text-align: center;
}

.segmented-chip--active {
	background: #243242;
	color: #f8fafc;
}

.preview-card {
	margin-top: 20rpx;
	padding: 20rpx;
}

.preview-image {
	width: 100%;
	border-radius: 22rpx;
	background: #edf2f7;
}

.compare-grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 18rpx;
	margin-top: 20rpx;
}

.mini-card {
	padding: 16rpx;
}

.mini-label {
	color: #334155;
	font-size: 24rpx;
	font-weight: 600;
}

.mini-image,
.mini-empty {
	width: 100%;
	height: 180rpx;
	margin-top: 12rpx;
	border-radius: 18rpx;
	background: #e2e8f0;
}

.mini-empty {
	display: flex;
	align-items: center;
	justify-content: center;
	color: #94a3b8;
	font-size: 24rpx;
}

.action-grid {
	display: flex;
	flex-direction: column;
	gap: 18rpx;
	margin-top: 24rpx;
}

.primary-btn,
.ghost-btn {
	border-radius: 999rpx;
	font-size: 28rpx;
}

.primary-btn {
	background: linear-gradient(90deg, #0f766e 0%, #2563eb 100%);
	color: #ffffff;
}

.ghost-btn {
	background: rgba(255, 255, 255, 0.92);
	color: #334155;
	border: 2rpx solid rgba(148, 163, 184, 0.2);
}
</style>
