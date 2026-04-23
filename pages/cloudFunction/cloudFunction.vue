<template>
	<view class="curtain-page">
		<view class="hero-card">
			<view class="hero-badge">IMAGE FUSION LAB</view>
			<view class="hero-title">AI 窗帘预览</view>
			<view class="hero-desc">上传空间背景图和窗帘材质图，通过 uniCloud 云函数生成图生图预览，并保留你自己的历史记录。</view>
			<view class="hero-footer">
				<text class="status-chip" :class="hasLogin ? 'status-chip--online' : 'status-chip--offline'">
					{{ hasLogin ? '已登录，可生成并查看私有历史' : '未登录，生成前请先登录' }}
				</text>
				<button v-if="!hasLogin" class="hero-login-btn" size="mini" type="primary" @click="goLogin">去登录</button>
			</view>
		</view>

		<view class="upload-grid">
			<view class="panel-card">
				<view class="panel-head">
					<text class="panel-title">背景图</text>
					<text class="panel-tip">房间场景图</text>
				</view>
				<view class="upload-box upload-box--cyan" @click="chooseImage('background')">
					<image v-if="form.backgroundUrl" :src="form.backgroundUrl" mode="aspectFill" class="upload-image" />
					<view v-else class="upload-placeholder">
						<text class="upload-plus">+</text>
						<text class="upload-text">点击上传背景图</text>
					</view>
				</view>
				<view class="upload-actions">
					<text class="upload-action" @click.stop="chooseImage('background')">重新上传</text>
					<text v-if="form.backgroundUrl" class="upload-action upload-action--danger" @click.stop="clearImage('background')">清空</text>
				</view>
			</view>

			<view class="panel-card">
				<view class="panel-head">
					<text class="panel-title">材质图</text>
					<text class="panel-tip">窗帘纹理图</text>
				</view>
				<view class="upload-box upload-box--violet" @click="chooseImage('texture')">
					<image v-if="form.textureUrl" :src="form.textureUrl" mode="aspectFill" class="upload-image" />
					<view v-else class="upload-placeholder">
						<text class="upload-plus">+</text>
						<text class="upload-text">点击上传材质图</text>
					</view>
				</view>
				<view class="upload-actions">
					<text class="upload-action" @click.stop="chooseImage('texture')">重新上传</text>
					<text v-if="form.textureUrl" class="upload-action upload-action--danger" @click.stop="clearImage('texture')">清空</text>
				</view>
			</view>
		</view>

		<view class="panel-card prompt-card">
			<view class="panel-head">
				<text class="panel-title">融合提示词</text>
				<text class="panel-tip">{{ promptLength }}/300</text>
			</view>
			<textarea
				v-model="form.prompt"
				class="prompt-input"
				maxlength="300"
				placeholder="描述你希望的窗帘融合效果"
				placeholder-class="prompt-placeholder"
			/>
			<view class="prompt-hint">建议描述材质覆盖区域、褶皱方向、光影真实感和整体色调。</view>
		</view>

		<view class="action-row">
			<button class="action-btn action-btn--primary" :loading="generating" :disabled="!canGenerate" @click="submitGenerate">
				{{ generating ? '生成中...' : '开始生成' }}
			</button>
			<button class="action-btn action-btn--ghost" :disabled="generating || !!uploadingField" @click="resetForm">清空当前</button>
		</view>

		<view v-if="resultUrl" class="panel-card result-card">
			<view class="panel-head">
				<text class="panel-title">生成结果</text>
				<text class="panel-tip">点击可预览大图</text>
			</view>
			<image :src="resultUrl" mode="widthFix" class="result-image" @click="previewSingle(resultUrl)" />
		</view>

		<view class="panel-card history-card">
			<view class="panel-head">
				<text class="panel-title">最近记录</text>
				<text class="panel-refresh" @click="refreshHistory">刷新</text>
			</view>

			<view v-if="!hasLogin" class="history-empty">
				<text class="history-empty-title">登录后可查看你的私有历史记录</text>
				<text class="history-empty-desc">当前方案按用户隔离存储，不再共享公开历史。</text>
			</view>
			<view v-else-if="historyLoading" class="history-empty">
				<text class="history-empty-title">历史记录加载中...</text>
			</view>
			<view v-else-if="historyList.length === 0" class="history-empty">
				<text class="history-empty-title">还没有生成记录</text>
				<text class="history-empty-desc">上传两张图并生成后，这里会展示最近 10 条结果。</text>
			</view>
			<view v-else class="history-list">
				<view v-for="item in historyList" :key="item._id" class="history-item" @click="applyHistory(item)">
					<image :src="item.resultUrl || item.backgroundUrl || item.textureUrl" mode="aspectFill" class="history-thumb" />
					<view class="history-body">
						<view class="history-top">
							<text class="history-status" :class="statusClass(item.status)">{{ formatStatus(item.status) }}</text>
							<text class="history-time">{{ formatTime(item.createTime) }}</text>
						</view>
						<text class="history-prompt">{{ item.prompt || '未填写提示词' }}</text>
						<view class="history-links">
							<text class="history-link" @click.stop="previewSingle(item.resultUrl || item.backgroundUrl || item.textureUrl)">预览</text>
							<text class="history-link" @click.stop="applyHistory(item)">回显</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
const DEFAULT_MODEL = 'gemini-3.1-flash-image-preview'
const DEFAULT_PROMPT = '将材质自然应用到窗帘区域，保持原场景结构、褶皱走向与真实光影，输出真实可用的窗帘预览图'

function createDefaultForm() {
	return {
		backgroundFileId: '',
		backgroundSourceId: '',
		backgroundUrl: '',
		textureFileId: '',
		textureSourceId: '',
		textureUrl: '',
		prompt: DEFAULT_PROMPT,
		model: DEFAULT_MODEL
	}
}

export default {
	data() {
		return {
			hasLogin: false,
			currentUid: '',
			generating: false,
			historyLoading: false,
			uploadingField: '',
			resultUrl: '',
			historyList: [],
			form: createDefaultForm()
		}
	},
	computed: {
		canGenerate() {
			return this.hasLogin
				&& !this.generating
				&& !this.uploadingField
				&& !!this.form.backgroundFileId
				&& !!this.form.backgroundSourceId
				&& !!this.form.textureFileId
				&& !!this.form.textureSourceId
				&& !!this.normalizeString(this.form.prompt)
		},
		promptLength() {
			return this.normalizeString(this.form.prompt).length
		}
	},
	onLoad() {
		this.syncLoginState()
		if (this.hasLogin) {
			this.loadHistory({
				silent: true
			})
		}
	},
	onShow() {
		const hadLogin = this.hasLogin
		this.syncLoginState()
		if (this.hasLogin && (!hadLogin || this.historyList.length === 0)) {
			this.loadHistory({
				silent: true
			})
		}
		if (!this.hasLogin) {
			this.historyList = []
		}
	},
	methods: {
		normalizeString(value) {
			return typeof value === 'string' ? value.trim() : ''
		},
		syncLoginState() {
			const currentUser = typeof uniCloud.getCurrentUserInfo === 'function' ? uniCloud.getCurrentUserInfo() : {}
			const tokenExpired = Number(currentUser && currentUser.tokenExpired || 0)
			const uid = this.normalizeString(currentUser && currentUser.uid)
			if (this.currentUid && this.currentUid !== uid) {
				this.form.backgroundFileId = ''
				this.form.backgroundSourceId = ''
				this.form.textureFileId = ''
				this.form.textureSourceId = ''
				this.resultUrl = ''
			}
			this.hasLogin = !!uid && tokenExpired > Date.now()
			this.currentUid = this.hasLogin ? uid : ''
		},
		ensureLogin(actionText) {
			this.syncLoginState()
			if (this.hasLogin) {
				return true
			}
			uni.showModal({
				content: `${actionText}前请先登录`,
				confirmText: '去登录',
				success: (res) => {
					if (res.confirm) {
						this.goLogin()
					}
				}
			})
			return false
		},
		goLogin() {
			const redirectUrl = encodeURIComponent('/pages/cloudFunction/cloudFunction')
			uni.navigateTo({
				url: `/uni_modules/uni-id-pages/pages/login/login-withoutpwd?uniIdRedirectUrl=${redirectUrl}`
			})
		},
		getFieldConfig(field) {
			return field === 'background' ? {
				label: '背景图',
				fileIdKey: 'backgroundFileId',
				sourceIdKey: 'backgroundSourceId',
				urlKey: 'backgroundUrl'
			} : {
				label: '材质图',
				fileIdKey: 'textureFileId',
				sourceIdKey: 'textureSourceId',
				urlKey: 'textureUrl'
			}
		},
		getFileExtension(filePath) {
			const cleanPath = this.normalizeString(filePath).split('?')[0]
			const match = cleanPath.match(/\.([a-zA-Z0-9]+)$/)
			return match ? match[1].toLowerCase() : 'png'
		},
		clearImage(field) {
			const config = this.getFieldConfig(field)
			this.form[config.fileIdKey] = ''
			this.form[config.sourceIdKey] = ''
			this.form[config.urlKey] = ''
		},
		resetForm() {
			this.form = createDefaultForm()
			this.resultUrl = ''
		},
		chooseImage(field) {
			if (this.uploadingField || this.generating) {
				return
			}
			if (!this.ensureLogin('上传图片')) {
				return
			}
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				success: (res) => {
					const filePath = ((res.tempFilePaths || [])[0] || '')
					if (!filePath) {
						return
					}
					this.uploadImage(field, filePath)
				}
			})
		},
		async uploadImage(field, filePath) {
			const config = this.getFieldConfig(field);
			console.log('uploadImage', field, filePath);
			const ext = this.getFileExtension(filePath)
			this.uploadingField = field
			uni.showLoading({
				title: '上传中...'
			})
			try {
				const ticketRes = await uniCloud.callFunction({
					name: 'curtain-preview-create-upload-ticket',
					data: {
						kind: field,
						ext
					}
				})
				const ticket = ticketRes.result || {}
				if (!ticket.success || !ticket.cloudPath || !ticket.sourceId) {
					throw new Error(ticket.message || `${config.label}上传凭证创建失败`)
				}
				const uploadRes = await uniCloud.uploadFile({
					filePath,
					cloudPath: ticket.cloudPath
				})
				const fileId = this.normalizeString(uploadRes.fileID || uploadRes.fileId)
				if (!fileId) {
					throw new Error(`${config.label}上传成功但未返回 fileID`)
				}
				this.form[config.fileIdKey] = fileId
				this.form[config.sourceIdKey] = ticket.sourceId
				this.form[config.urlKey] = filePath
				uni.showToast({
					title: `${config.label}上传成功`,
					icon: 'none'
				})
			} catch (error) {
				this.clearImage(field)
				uni.showModal({
					content: error.message || `${config.label}上传失败`,
					showCancel: false
				})
			} finally {
				uni.hideLoading()
				this.uploadingField = ''
			}
		},
		async submitGenerate() {
			if (!this.ensureLogin('生成预览')) {
				return
			}
			if (!this.canGenerate) {
				uni.showModal({
					content: '请先上传背景图、材质图并填写提示词',
					showCancel: false
				})
				return
			}
			this.generating = true
			uni.showLoading({
				title: '生成中...'
			})
			try {
				const res = await uniCloud.callFunction({
					name: 'curtain-preview-generate',
					data: {
						backgroundFileId: this.form.backgroundFileId,
						backgroundSourceId: this.form.backgroundSourceId,
						textureFileId: this.form.textureFileId,
						textureSourceId: this.form.textureSourceId,
						prompt: this.normalizeString(this.form.prompt),
						model: this.form.model
					}
				})
				const result = res.result || {}
				if (!result.success) {
					throw new Error(result.message || '生成失败')
				}
				this.resultUrl = this.normalizeString(result.resultUrl)
				this.form.backgroundFileId = ''
				this.form.backgroundSourceId = ''
				this.form.textureFileId = ''
				this.form.textureSourceId = ''
				await this.loadHistory({
					silent: true
				})
				uni.showToast({
					title: '生成成功',
					icon: 'none'
				})
			} catch (error) {
				const errorMessage = this.normalizeString(error.message)
				if (/已被使用|已过期/.test(errorMessage)) {
					this.form.backgroundFileId = ''
					this.form.backgroundSourceId = ''
					this.form.textureFileId = ''
					this.form.textureSourceId = ''
				}
				uni.showModal({
					content: errorMessage || '生成失败',
					showCancel: false
				})
			} finally {
				uni.hideLoading()
				this.generating = false
			}
		},
		async loadHistory({
			silent = false
		} = {}) {
			this.syncLoginState()
			if (!this.hasLogin) {
				this.historyList = []
				return
			}
			this.historyLoading = true
			try {
				const res = await uniCloud.callFunction({
					name: 'curtain-preview-history',
					data: {
						pageNo: 1,
						pageSize: 10
					}
				})
				const result = res.result || {}
				if (!result.success) {
					throw new Error(result.message || '历史记录加载失败')
				}
				this.historyList = Array.isArray(result.list) ? result.list.map((item) => ({
					...item,
					backgroundUrl: this.normalizeString(item.backgroundUrl),
					textureUrl: this.normalizeString(item.textureUrl),
					resultUrl: this.normalizeString(item.resultUrl)
				})) : []
			} catch (error) {
				this.historyList = []
				if (!silent) {
					uni.showToast({
						title: error.message || '历史记录加载失败',
						icon: 'none'
					})
				}
			} finally {
				this.historyLoading = false
			}
		},
		refreshHistory() {
			if (!this.hasLogin) {
				this.ensureLogin('查看历史记录')
				return
			}
			this.loadHistory()
		},
		applyHistory(item) {
			this.form.prompt = this.normalizeString(item && item.prompt) || DEFAULT_PROMPT
			this.form.model = this.normalizeString(item && item.model) || DEFAULT_MODEL
			this.form.backgroundUrl = this.normalizeString(item && item.backgroundUrl)
			this.form.textureUrl = this.normalizeString(item && item.textureUrl)
			this.form.backgroundFileId = ''
			this.form.backgroundSourceId = ''
			this.form.textureFileId = ''
			this.form.textureSourceId = ''
			this.resultUrl = this.normalizeString(item && item.resultUrl)
			uni.showToast({
				title: '已回显历史记录，如需重新生成请重新上传原图',
				icon: 'none',
				duration: 2600
			})
		},
		previewSingle(url) {
			const targetUrl = this.normalizeString(url)
			if (!targetUrl) {
				return
			}
			uni.previewImage({
				urls: [targetUrl],
				current: targetUrl
			})
		},
		formatStatus(status) {
			if (status === 'success') {
				return '成功'
			}
			if (status === 'fail') {
				return '失败'
			}
			return '处理中'
		},
		statusClass(status) {
			if (status === 'success') {
				return 'history-status--success'
			}
			if (status === 'fail') {
				return 'history-status--fail'
			}
			return 'history-status--processing'
		},
		formatTime(value) {
			if (!value) {
				return ''
			}
			let date = null
			if (value instanceof Date) {
				date = value
			} else if (typeof value === 'number' || typeof value === 'string') {
				const rawDate = new Date(value)
				if (!Number.isNaN(rawDate.getTime())) {
					date = rawDate
				}
			} else if (typeof value === 'object') {
				if (typeof value.getTime === 'function') {
					const time = value.getTime()
					if (!Number.isNaN(time)) {
						date = new Date(time)
					}
				} else if (value.$date) {
					const rawDate = new Date(value.$date)
					if (!Number.isNaN(rawDate.getTime())) {
						date = rawDate
					}
				} else if (typeof value._seconds === 'number') {
					date = new Date(value._seconds * 1000)
				} else if (typeof value.seconds === 'number') {
					date = new Date(value.seconds * 1000)
				}
			}
			if (!date || Number.isNaN(date.getTime())) {
				return ''
			}
			const year = date.getFullYear()
			const month = `${date.getMonth() + 1}`.padStart(2, '0')
			const day = `${date.getDate()}`.padStart(2, '0')
			const hour = `${date.getHours()}`.padStart(2, '0')
			const minute = `${date.getMinutes()}`.padStart(2, '0')
			return `${year}-${month}-${day} ${hour}:${minute}`
		}
	}
}
</script>

<style>
page {
	background: #07111f;
}

.curtain-page {
	min-height: 100vh;
	padding: 24rpx 24rpx 40rpx;
	background:
		radial-gradient(circle at top left, rgba(20, 184, 166, 0.18), transparent 32%),
		radial-gradient(circle at top right, rgba(59, 130, 246, 0.18), transparent 30%),
		linear-gradient(180deg, #081220 0%, #0b1729 48%, #111f34 100%);
	box-sizing: border-box;
}

.hero-card,
.panel-card {
	background: rgba(10, 19, 35, 0.88);
	border: 2rpx solid rgba(148, 163, 184, 0.16);
	border-radius: 28rpx;
	box-shadow: 0 24rpx 60rpx rgba(3, 10, 22, 0.32);
	backdrop-filter: blur(10rpx);
}

.hero-card {
	padding: 32rpx;
	margin-bottom: 24rpx;
}

.hero-badge {
	display: inline-flex;
	padding: 10rpx 16rpx;
	border-radius: 999rpx;
	background: rgba(14, 165, 233, 0.14);
	color: #6ee7f9;
	font-size: 22rpx;
	letter-spacing: 2rpx;
}

.hero-title {
	margin-top: 18rpx;
	color: #f8fafc;
	font-size: 44rpx;
	font-weight: 700;
}

.hero-desc {
	margin-top: 14rpx;
	color: #94a3b8;
	font-size: 26rpx;
	line-height: 1.6;
}

.hero-footer {
	margin-top: 24rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16rpx;
}

.status-chip {
	flex: 1;
	padding: 14rpx 20rpx;
	border-radius: 999rpx;
	font-size: 24rpx;
	line-height: 1.4;
}

.status-chip--online {
	background: rgba(16, 185, 129, 0.14);
	color: #86efac;
}

.status-chip--offline {
	background: rgba(245, 158, 11, 0.14);
	color: #fcd34d;
}

.hero-login-btn {
	margin: 0;
	padding: 0 24rpx;
	border-radius: 999rpx;
	background: linear-gradient(90deg, #0891b2 0%, #2563eb 100%);
}

.upload-grid {
	display: flex;
	flex-direction: column;
	margin-bottom: 24rpx;
}

.panel-card {
	padding: 28rpx;
	margin-bottom: 24rpx;
}

.panel-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20rpx;
}

.panel-title {
	color: #f8fafc;
	font-size: 30rpx;
	font-weight: 600;
}

.panel-tip,
.panel-refresh {
	color: #7dd3fc;
	font-size: 24rpx;
}

.upload-box {
	height: 320rpx;
	border-radius: 22rpx;
	overflow: hidden;
	position: relative;
}

.upload-box--cyan {
	background: linear-gradient(135deg, rgba(6, 182, 212, 0.18) 0%, rgba(15, 23, 42, 0.9) 100%);
	border: 2rpx dashed rgba(103, 232, 249, 0.34);
}

.upload-box--violet {
	background: linear-gradient(135deg, rgba(96, 165, 250, 0.18) 0%, rgba(30, 41, 59, 0.94) 100%);
	border: 2rpx dashed rgba(147, 197, 253, 0.34);
}

.upload-image {
	width: 100%;
	height: 100%;
}

.upload-placeholder {
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: #cbd5e1;
}

.upload-plus {
	font-size: 56rpx;
	line-height: 1;
}

.upload-text {
	margin-top: 12rpx;
	font-size: 26rpx;
}

.upload-actions {
	margin-top: 18rpx;
	display: flex;
	justify-content: space-between;
}

.upload-action {
	color: #7dd3fc;
	font-size: 24rpx;
}

.upload-action--danger {
	color: #fca5a5;
}

.prompt-card {
	padding-bottom: 24rpx;
}

.prompt-input {
	width: 100%;
	height: 220rpx;
	padding: 24rpx;
	border-radius: 24rpx;
	box-sizing: border-box;
	background: rgba(2, 6, 23, 0.72);
	color: #f8fafc;
	font-size: 28rpx;
	line-height: 1.6;
}

.prompt-placeholder {
	color: #64748b;
}

.prompt-hint {
	margin-top: 16rpx;
	color: #64748b;
	font-size: 24rpx;
	line-height: 1.5;
}

.action-row {
	display: flex;
	gap: 20rpx;
	margin-bottom: 24rpx;
}

.action-btn {
	flex: 1;
	border-radius: 999rpx;
	font-size: 28rpx;
}

.action-btn--primary {
	background: linear-gradient(90deg, #06b6d4 0%, #2563eb 100%);
	color: #ffffff;
}

.action-btn--ghost {
	background: rgba(15, 23, 42, 0.82);
	color: #cbd5e1;
	border: 2rpx solid rgba(148, 163, 184, 0.18);
}

.result-card {
	padding-bottom: 20rpx;
}

.result-image {
	width: 100%;
	border-radius: 24rpx;
	background: rgba(2, 6, 23, 0.68);
}

.history-card {
	margin-bottom: 0;
}

.history-empty {
	padding: 36rpx 20rpx;
	border-radius: 22rpx;
	background: rgba(15, 23, 42, 0.7);
	text-align: center;
}

.history-empty-title {
	display: block;
	color: #e2e8f0;
	font-size: 28rpx;
}

.history-empty-desc {
	display: block;
	margin-top: 12rpx;
	color: #64748b;
	font-size: 24rpx;
	line-height: 1.6;
}

.history-list {
	display: flex;
	flex-direction: column;
	gap: 18rpx;
}

.history-item {
	display: flex;
	gap: 18rpx;
	padding: 18rpx;
	border-radius: 22rpx;
	background: rgba(15, 23, 42, 0.72);
}

.history-thumb {
	width: 168rpx;
	height: 168rpx;
	border-radius: 18rpx;
	background: rgba(30, 41, 59, 0.9);
	flex-shrink: 0;
}

.history-body {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.history-top {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16rpx;
}

.history-status {
	padding: 8rpx 14rpx;
	border-radius: 999rpx;
	font-size: 22rpx;
}

.history-status--success {
	background: rgba(16, 185, 129, 0.16);
	color: #86efac;
}

.history-status--fail {
	background: rgba(248, 113, 113, 0.16);
	color: #fda4af;
}

.history-status--processing {
	background: rgba(59, 130, 246, 0.16);
	color: #93c5fd;
}

.history-time {
	color: #64748b;
	font-size: 22rpx;
}

.history-prompt {
	margin-top: 14rpx;
	color: #cbd5e1;
	font-size: 26rpx;
	line-height: 1.6;
	display: -webkit-box;
	overflow: hidden;
	text-overflow: ellipsis;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

.history-links {
	margin-top: 18rpx;
	display: flex;
	gap: 24rpx;
}

.history-link {
	color: #7dd3fc;
	font-size: 24rpx;
}

@media screen and (max-width: 640px) {
	.hero-footer,
	.action-row {
		flex-direction: column;
	}

	.hero-login-btn,
	.action-btn {
		width: 100%;
	}

	.history-item {
		flex-direction: column;
	}

	.history-thumb {
		width: 100%;
		height: 280rpx;
	}
}
</style>
