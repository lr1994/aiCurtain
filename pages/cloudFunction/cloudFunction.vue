<template>
	<view class="curtain-page">
		<view class="hero-shell">
			<view class="hero-card">
				<view class="hero-topbar">
					<view class="hero-brand">{{ homeView.brandText }}</view>
					<view class="hero-avatar" @click="openProfile">
						<text class="hero-avatar-icon">{{ hasLogin ? '我' : '登' }}</text>
					</view>
				</view>
				<view class="hero-greeting">{{ homeView.greetingText }}</view>
				<view class="hero-points">{{ homeView.pointsText }}</view>
				<view class="hero-hint">{{ homeView.loginHintText }}</view>
			</view>
		</view>

		<view class="workbench-card">
			<view class="upload-deck">
				<view class="upload-card" @click="chooseImage('background')">
					<view class="upload-title">上传空窗照</view>
					<image v-if="form.backgroundUrl" :src="form.backgroundUrl" mode="aspectFill" class="upload-preview" />
					<view v-else class="upload-illustration upload-illustration--window">
						<view class="illustration-frame">
							<view class="illustration-hill"></view>
							<view class="illustration-sun"></view>
						</view>
					</view>
					<view class="upload-trigger">
						<text class="upload-trigger-icon">+</text>
					</view>
					<view class="upload-footer">
						<text class="upload-link" @click.stop="chooseImage('background')">{{ form.backgroundUrl ? '重新上传' : '选择图片' }}</text>
						<text v-if="form.backgroundUrl" class="upload-link upload-link--danger" @click.stop="clearImage('background')">清空</text>
					</view>
				</view>

				<view class="upload-arrow">
					<text>></text>
				</view>

				<view class="upload-card" @click="chooseImage('texture')">
					<view class="upload-title">上传面料/成品图</view>
					<image v-if="form.textureUrl" :src="form.textureUrl" mode="aspectFill" class="upload-preview" />
					<view v-else class="upload-illustration upload-illustration--fabric">
						<view class="fabric-roll">
							<view class="fabric-core"></view>
						</view>
					</view>
					<view class="upload-trigger">
						<text class="upload-trigger-icon">+</text>
					</view>
					<view class="upload-footer">
						<text class="upload-link" @click.stop="chooseImage('texture')">{{ form.textureUrl ? '重新上传' : '选择图片' }}</text>
						<text v-if="form.textureUrl" class="upload-link upload-link--danger" @click.stop="clearImage('texture')">清空</text>
					</view>
				</view>
			</view>

			<view class="section-title">风格设置</view>

			<picker :range="pleatOptions" range-key="label" :value="selectedPleatIndex" @change="handlePleatChange">
				<view class="setting-row">
					<text class="setting-label">褶皱倍数：</text>
					<view class="setting-value">
						<text>{{ currentPleatLabel }}</text>
						<text class="setting-arrow">▼</text>
					</view>
				</view>
			</picker>

			<picker :range="headStyleOptions" range-key="label" :value="selectedHeadStyleIndex" @change="handleHeadStyleChange">
				<view class="setting-row">
					<text class="setting-label">帘头款式：</text>
					<view class="setting-value">
						<text>{{ currentHeadStyleLabel }}</text>
						<text class="setting-arrow">▼</text>
					</view>
				</view>
			</picker>

			<view class="switch-row" @click="toggleIncludeSheer">
				<text class="setting-label">包含纱帘？</text>
				<view class="checkbox-box" :class="styleForm.includeSheer ? 'checkbox-box--checked' : ''">
					<text v-if="styleForm.includeSheer">x</text>
				</view>
			</view>

			<view class="prompt-panel">
				<view class="prompt-head">
					<text class="prompt-title">高级提示词</text>
					<text class="prompt-count">{{ promptLength }}/300</text>
				</view>
				<textarea
					v-model="form.prompt"
					class="prompt-input"
					maxlength="300"
					placeholder="描述你希望的窗帘融合效果"
					placeholder-class="prompt-placeholder"
				/>
			</view>

			<button class="submit-btn" :loading="generating" :disabled="homeView.submitDisabled" @click="submitGenerate">
				{{ homeView.submitText }}
			</button>

			<view class="recharge-line">
				<text class="recharge-text">点数不足？</text>
				<text class="recharge-link" @click="goRecharge">去充值</text>
			</view>
		</view>

		<view v-if="resultUrl" class="result-card">
			<view class="section-head">
				<text class="section-head-title">生成结果</text>
				<text class="section-head-link" @click="previewSingle(resultUrl)">预览大图</text>
			</view>
			<image :src="resultUrl" mode="widthFix" class="result-image" @click="previewSingle(resultUrl)" />
		</view>

		<view class="history-card">
			<view class="section-head">
				<text class="section-head-title">最近记录</text>
				<text class="section-head-link" @click="refreshHistory">刷新</text>
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
import renderSession from '../../common/curtain-app/frontend/render-session.js'
import pageModels from '../../common/curtain-app/frontend/page-models.js'
import pointSummaryModels from '../../common/curtain-app/frontend/point-summary.js'

const {
	readSceneSelection,
	clearSceneSelection,
	buildRenderDraft,
	saveRenderResult
} = renderSession
const { buildRenderHomeViewModel } = pageModels
const {
	createEmptyPointSummary,
	normalizePointSummary
} = pointSummaryModels
const DEFAULT_MODEL = 'gemini-3.1-flash-image-preview'
const DEFAULT_PROMPT = '将材质自然应用到窗帘区域，保持原场景结构、褶皱走向与真实光影，输出真实可用的窗帘预览图'
const PLEAT_OPTIONS = [
	{ value: '1.8', label: '1.8倍' },
	{ value: '2.0', label: '2.0倍' },
	{ value: '2.2', label: '2.2倍' }
]
const HEAD_STYLE_OPTIONS = [
	{ value: 'simple', label: '简约韩式' },
	{ value: 'wave', label: '波浪帘头' },
	{ value: 'box', label: '盒型帘头' }
]

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

function createDefaultStyleForm() {
	return {
		pleatMultiple: '2.0',
		headStyle: 'simple',
		includeSheer: true
	}
}

export default {
	created() {
		this.syncLoginState()
		this.pointSummaryLoading = this.hasLogin
	},
	data() {
		return {
			hasLogin: false,
			currentUid: '',
			generating: false,
			historyLoading: false,
			uploadingField: '',
			resultUrl: '',
			historyList: [],
			pointSummary: createEmptyPointSummary(),
			pointSummaryLoading: false,
			pointSummaryError: '',
			form: createDefaultForm(),
			styleForm: createDefaultStyleForm(),
			pleatOptions: PLEAT_OPTIONS,
			headStyleOptions: HEAD_STYLE_OPTIONS
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
		},
		homeView() {
			return buildRenderHomeViewModel({
				hasLogin: this.hasLogin,
				balance: this.pointSummary.balance,
				generating: this.generating,
				canGenerate: this.canGenerate,
				pointSummaryLoading: this.pointSummaryLoading,
				pointSummaryError: this.pointSummaryError
			})
		},
		selectedPleatIndex() {
			const index = this.pleatOptions.findIndex((item) => item.value === this.styleForm.pleatMultiple)
			return index < 0 ? 1 : index
		},
		selectedHeadStyleIndex() {
			const index = this.headStyleOptions.findIndex((item) => item.value === this.styleForm.headStyle)
			return index < 0 ? 0 : index
		},
		currentPleatLabel() {
			return (this.pleatOptions[this.selectedPleatIndex] || {}).label || '2.0倍'
		},
		currentHeadStyleLabel() {
			return (this.headStyleOptions[this.selectedHeadStyleIndex] || {}).label || '简约韩式'
		}
	},
	onLoad() {
		this.handlePageLoad()
	},
	onShow() {
		this.handlePageShow()
	},
	methods: {
		handlePageLoad() {
			this.syncLoginState()
			if (this.hasLogin) {
				this.loadHistory({
					silent: true
				})
			}
		},
		handlePageShow() {
			const hadLogin = this.hasLogin
			this.syncLoginState()
			this.applySceneSelection()
			if (this.hasLogin && (!hadLogin || this.historyList.length === 0)) {
				this.loadHistory({
					silent: true
				})
			}
			if (this.hasLogin) {
				this.loadPointSummary()
			}
			if (!this.hasLogin) {
				this.historyList = []
				this.pointSummary = createEmptyPointSummary()
				this.pointSummaryLoading = false
				this.pointSummaryError = ''
			}
		},
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
			const redirectUrl = encodeURIComponent('/pages/render/index')
			uni.navigateTo({
				url: `/uni_modules/uni-id-pages/pages/login/login-withoutpwd?uniIdRedirectUrl=${redirectUrl}`
			})
		},
		openProfile() {
			if (!this.hasLogin) {
				this.goLogin()
				return
			}
			uni.navigateTo({
				url: '/uni_modules/uni-id-pages/pages/userinfo/userinfo'
			})
		},
		goRecharge() {
			if (!this.hasLogin) {
				this.goLogin()
				return
			}
			uni.navigateTo({
				url: '/pages/profile/recharge'
			})
		},
		handlePleatChange(event) {
			const index = Number(event && event.detail && event.detail.value || 0)
			const target = this.pleatOptions[index]
			if (target) {
				this.styleForm.pleatMultiple = target.value
			}
		},
		handleHeadStyleChange(event) {
			const index = Number(event && event.detail && event.detail.value || 0)
			const target = this.headStyleOptions[index]
			if (target) {
				this.styleForm.headStyle = target.value
			}
		},
		toggleIncludeSheer() {
			this.styleForm.includeSheer = !this.styleForm.includeSheer
		},
		applySceneSelection() {
			return this.prepareSceneSelection()
		},
		async prepareSceneSelection() {
			const scene = readSceneSelection()
			const draft = buildRenderDraft(scene)
			const hasDraft = !!(
				draft.sceneTemplateId
				|| draft.backgroundImage
				|| draft.textureImage
				|| draft.prompt
			)
			if (!hasDraft) {
				return
			}
			this.form.backgroundFileId = ''
			this.form.backgroundSourceId = ''
			this.form.backgroundUrl = draft.backgroundImage
			this.form.textureUrl = draft.textureImage || ''
			this.form.prompt = draft.prompt || DEFAULT_PROMPT
			this.form.model = draft.model || DEFAULT_MODEL
			this.form.textureFileId = ''
			this.form.textureSourceId = ''
			this.styleForm = {
				pleatMultiple: draft.config && draft.config.pleatMultiple || '2.0',
				headStyle: draft.config && draft.config.headStyle || 'simple',
				includeSheer: typeof (draft.config && draft.config.includeSheer) === 'boolean' ? draft.config.includeSheer : true
			}
			this.resultUrl = ''
			if (!draft.backgroundFileId) {
				clearSceneSelection()
				uni.showToast({
					title: draft.textureImage || draft.prompt ? '作品信息已回填，如需生成请重新上传原图' : '样板间已回填，如需生成请补传背景图原图',
					icon: 'none',
					duration: 2600
				})
				return
			}
			if (!this.hasLogin) {
				uni.showToast({
					title: '样板间已回填，登录后可直接生成',
					icon: 'none',
					duration: 2600
				})
				return
			}
			uni.showLoading({
				title: '同步样板间...'
			})
			try {
				const res = await uniCloud.callFunction({
					name: 'curtain-scene-create-source-ticket',
					data: {
						sceneTemplateId: draft.sceneTemplateId
					}
				})
				const result = res.result || {}
				if (!result.success || !result.sourceId || !result.backgroundFileId) {
					throw new Error(result.message || '样板间背景图准备失败')
				}
				this.form.backgroundFileId = this.normalizeString(result.backgroundFileId)
				this.form.backgroundSourceId = this.normalizeString(result.sourceId)
				if (this.normalizeString(result.backgroundUrl)) {
					this.form.backgroundUrl = this.normalizeString(result.backgroundUrl)
				}
				clearSceneSelection()
				uni.showToast({
					title: '样板间已回填，可继续上传材质图',
					icon: 'none',
					duration: 2200
				})
			} catch (error) {
				this.form.backgroundFileId = ''
				this.form.backgroundSourceId = ''
				uni.showToast({
					title: this.normalizeString(error.message) || '样板间已回填，请补传背景原图',
					icon: 'none',
					duration: 2800
				})
				clearSceneSelection()
			} finally {
				uni.hideLoading()
			}
		},
		async loadPointSummary() {
			this.pointSummaryLoading = true
			this.pointSummaryError = ''
			try {
				const res = await uniCloud.callFunction({
					name: 'curtain-point-summary',
					data: {}
				})
				const result = res.result || {}
				if (!result.success) {
					throw new Error(result.message || '点数账户加载失败')
				}
				this.pointSummary = normalizePointSummary(result)
				this.pointSummaryError = ''
			} catch (error) {
				const errorMessage = this.normalizeString(error && error.message) || '点数账户加载失败'
				this.pointSummary = createEmptyPointSummary()
				this.pointSummaryError = errorMessage
				uni.showToast({
					title: errorMessage,
					icon: 'none',
					duration: 2500
				})
			} finally {
				this.pointSummaryLoading = false
			}
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
			this.styleForm = createDefaultStyleForm()
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
			const config = this.getFieldConfig(field)
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
				const detailPayload = {
					backgroundUrl: this.normalizeString(this.form.backgroundUrl),
					textureUrl: this.normalizeString(this.form.textureUrl),
					prompt: this.normalizeString(this.form.prompt),
					model: this.form.model,
					status: 'success'
				}
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
				saveRenderResult({
					...detailPayload,
					recordId: this.normalizeString(result.recordId),
					resultUrl: this.normalizeString(result.resultUrl),
					coverUrl: this.normalizeString(result.resultUrl),
					errorMessage: ''
				})
				this.form.backgroundFileId = ''
				this.form.backgroundSourceId = ''
				this.form.textureFileId = ''
				this.form.textureSourceId = ''
				await this.loadPointSummary()
				await this.loadHistory({
					silent: true
				})
				uni.navigateTo({
					url: '/pages/render/result'
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
	background: #ebe4d8;
}

.curtain-page {
	min-height: 100vh;
	padding: 26rpx 22rpx 40rpx;
	background:
		radial-gradient(circle at top, rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0) 34%),
		linear-gradient(180deg, #d7c7ae 0%, #efe7da 26%, #efe9de 100%);
	box-sizing: border-box;
}

.hero-shell {
	padding: 18rpx 10rpx 14rpx;
	border-radius: 34rpx;
	background: rgba(255, 255, 255, 0.26);
	backdrop-filter: blur(14rpx);
}

.hero-card,
.workbench-card,
.result-card,
.history-card {
	background: rgba(255, 251, 245, 0.96);
	border: 2rpx solid rgba(197, 170, 123, 0.16);
	border-radius: 34rpx;
	box-shadow: 0 20rpx 48rpx rgba(102, 79, 42, 0.12);
}

.hero-card {
	padding: 26rpx 26rpx 28rpx;
}

.hero-topbar {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	min-height: 56rpx;
}

.hero-brand {
	position: absolute;
	left: 50%;
	transform: translateX(-50%);
	color: #31210f;
	font-size: 30rpx;
	font-weight: 600;
}

.hero-avatar {
	width: 54rpx;
	height: 54rpx;
	border-radius: 50%;
	border: 2rpx solid rgba(49, 33, 15, 0.8);
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.65);
}

.hero-avatar-icon {
	color: #31210f;
	font-size: 24rpx;
	font-weight: 600;
}

.hero-greeting {
	margin-top: 30rpx;
	color: #20160a;
	font-size: 58rpx;
	font-weight: 700;
	line-height: 1.14;
}

.hero-points,
.hero-hint {
	margin-top: 14rpx;
	color: #4a3a25;
	font-size: 28rpx;
}

.hero-hint {
	color: #7f6a4d;
	font-size: 24rpx;
}

.workbench-card,
.result-card,
.history-card {
	margin-top: 18rpx;
	padding: 24rpx 22rpx 26rpx;
}

.upload-deck {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12rpx;
}

.upload-card {
	flex: 1;
	min-width: 0;
	padding: 22rpx 18rpx 18rpx;
	border-radius: 28rpx;
	border: 3rpx solid rgba(197, 170, 123, 0.72);
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(247, 241, 231, 0.96) 100%);
	box-sizing: border-box;
}

.upload-title {
	color: #2f2112;
	font-size: 28rpx;
	font-weight: 600;
	text-align: center;
}

.upload-preview,
.upload-illustration {
	width: 100%;
	height: 224rpx;
	margin-top: 22rpx;
	border-radius: 24rpx;
	background: rgba(250, 244, 234, 0.92);
}

.upload-preview {
	object-fit: cover;
}

.upload-illustration {
	display: flex;
	align-items: center;
	justify-content: center;
}

.illustration-frame {
	position: relative;
	width: 108rpx;
	height: 78rpx;
	border: 6rpx solid #c6aa7d;
	border-radius: 16rpx;
	box-sizing: border-box;
}

.illustration-hill {
	position: absolute;
	left: 14rpx;
	bottom: 10rpx;
	width: 48rpx;
	height: 22rpx;
	border-left: 6rpx solid #c6aa7d;
	border-bottom: 6rpx solid #c6aa7d;
	transform: skewX(-24deg);
}

.illustration-sun {
	position: absolute;
	right: 12rpx;
	top: 12rpx;
	width: 14rpx;
	height: 14rpx;
	border-radius: 50%;
	background: #c6aa7d;
}

.fabric-roll {
	position: relative;
	width: 84rpx;
	height: 108rpx;
	border: 6rpx solid #c6aa7d;
	border-left-width: 10rpx;
	border-radius: 36rpx 20rpx 24rpx 36rpx;
	transform: rotate(18deg);
	box-sizing: border-box;
}

.fabric-core {
	position: absolute;
	left: -18rpx;
	bottom: 16rpx;
	width: 34rpx;
	height: 34rpx;
	border-radius: 50%;
	border: 6rpx solid #c6aa7d;
	background: rgba(255, 255, 255, 0.98);
	box-sizing: border-box;
}

.upload-trigger {
	width: 84rpx;
	height: 84rpx;
	margin: 14rpx auto 0;
	border-radius: 50%;
	background: linear-gradient(180deg, #1e7987 0%, #0b5f73 100%);
	box-shadow: 0 10rpx 20rpx rgba(14, 95, 110, 0.24);
	display: flex;
	align-items: center;
	justify-content: center;
}

.upload-trigger-icon {
	color: #ffffff;
	font-size: 38rpx;
	font-weight: 600;
}

.upload-footer {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 18rpx;
	margin-top: 16rpx;
	min-height: 32rpx;
}

.upload-link {
	color: #0b5f73;
	font-size: 22rpx;
}

.upload-link--danger {
	color: #b25447;
}

.upload-arrow {
	width: 34rpx;
	text-align: center;
	color: #b89a68;
	font-size: 44rpx;
	font-weight: 400;
	flex-shrink: 0;
}

.section-title {
	margin-top: 28rpx;
	color: #2f2112;
	font-size: 34rpx;
	font-weight: 700;
}

.setting-row,
.switch-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 18rpx;
	padding: 20rpx 22rpx;
	border-radius: 18rpx;
	background: #ffffff;
	border: 2rpx solid rgba(198, 170, 125, 0.34);
}

.setting-label {
	color: #2f2112;
	font-size: 28rpx;
	font-weight: 600;
}

.setting-value {
	display: flex;
	align-items: center;
	gap: 14rpx;
	color: #5b4930;
	font-size: 28rpx;
}

.setting-arrow {
	color: #b89a68;
	font-size: 20rpx;
}

.checkbox-box {
	width: 38rpx;
	height: 38rpx;
	border-radius: 8rpx;
	border: 2rpx solid #8fa4ab;
	color: #0b5f73;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24rpx;
	font-weight: 700;
	box-sizing: border-box;
}

.checkbox-box--checked {
	border-color: #0b5f73;
	background: rgba(11, 95, 115, 0.08);
}

.prompt-panel {
	margin-top: 20rpx;
	padding: 18rpx 20rpx 20rpx;
	border-radius: 24rpx;
	background: rgba(255, 255, 255, 0.88);
}

.prompt-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.prompt-title,
.prompt-count {
	color: #6a5538;
	font-size: 24rpx;
}

.prompt-input {
	width: 100%;
	height: 148rpx;
	margin-top: 14rpx;
	padding: 18rpx;
	border-radius: 18rpx;
	box-sizing: border-box;
	background: #f8f2e9;
	color: #2f2112;
	font-size: 26rpx;
	line-height: 1.6;
}

.prompt-placeholder {
	color: #a5927b;
}

.submit-btn {
	margin-top: 24rpx;
	border-radius: 999rpx;
	background: linear-gradient(90deg, #14768a 0%, #0e8ca0 100%);
	color: #ffffff;
	font-size: 32rpx;
	font-weight: 700;
	box-shadow: 0 14rpx 24rpx rgba(20, 118, 138, 0.2);
}

.submit-btn[disabled] {
	opacity: 0.66;
}

.recharge-line {
	margin-top: 18rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10rpx;
}

.recharge-text,
.recharge-link {
	font-size: 24rpx;
}

.recharge-text {
	color: #7f6a4d;
}

.recharge-link {
	color: #0b5f73;
	font-weight: 600;
}

.section-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.section-head-title {
	color: #2f2112;
	font-size: 30rpx;
	font-weight: 700;
}

.section-head-link {
	color: #0b5f73;
	font-size: 24rpx;
}

.result-image {
	width: 100%;
	margin-top: 20rpx;
	border-radius: 24rpx;
	background: #efe6d8;
}

.history-empty {
	margin-top: 18rpx;
	padding: 34rpx 18rpx;
	border-radius: 24rpx;
	background: #fbf7f0;
	text-align: center;
}

.history-empty-title {
	display: block;
	color: #4b3a26;
	font-size: 28rpx;
}

.history-empty-desc {
	display: block;
	margin-top: 12rpx;
	color: #8a7558;
	font-size: 24rpx;
	line-height: 1.6;
}

.history-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
	margin-top: 18rpx;
}

.history-item {
	display: flex;
	gap: 16rpx;
	padding: 16rpx;
	border-radius: 24rpx;
	background: #fbf7f0;
}

.history-thumb {
	width: 152rpx;
	height: 152rpx;
	border-radius: 18rpx;
	background: #ece2d2;
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
	gap: 12rpx;
}

.history-status {
	padding: 8rpx 14rpx;
	border-radius: 999rpx;
	font-size: 22rpx;
}

.history-status--success {
	background: rgba(16, 185, 129, 0.14);
	color: #2d7d46;
}

.history-status--fail {
	background: rgba(248, 113, 113, 0.14);
	color: #bc534e;
}

.history-status--processing {
	background: rgba(59, 130, 246, 0.14);
	color: #476d9b;
}

.history-time {
	color: #927c5d;
	font-size: 22rpx;
}

.history-prompt {
	margin-top: 12rpx;
	color: #3f301d;
	font-size: 26rpx;
	line-height: 1.5;
	display: -webkit-box;
	overflow: hidden;
	text-overflow: ellipsis;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

.history-links {
	margin-top: 16rpx;
	display: flex;
	gap: 22rpx;
}

.history-link {
	color: #0b5f73;
	font-size: 24rpx;
}

@media screen and (max-width: 640px) {
	.hero-greeting {
		font-size: 50rpx;
	}

	.upload-card {
		padding-left: 14rpx;
		padding-right: 14rpx;
	}

	.upload-title {
		font-size: 26rpx;
	}

	.upload-preview,
	.upload-illustration {
		height: 196rpx;
	}
}
</style>
