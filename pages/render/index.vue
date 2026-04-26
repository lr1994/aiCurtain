<template>
	<RenderCorePage ref="renderCorePage" />
</template>

<script>
import RenderCorePage from '@/pages/cloudFunction/cloudFunction.vue'
import { callRenderCoreHook } from '@/common/curtain-app/frontend/render-core-bridge.js'

export default {
	name: 'RenderIndexPage',
	data() {
		return {
			pageLoadOptions: {}
		}
	},
	components: {
		RenderCorePage
	},
	onLoad(options) {
		this.pageLoadOptions = options || {}
	},
	onReady() {
		this.$nextTick(() => {
			callRenderCoreHook(this.$refs.renderCorePage, 'handlePageLoad', this.pageLoadOptions)
		})
	},
	onShow() {
		this.$nextTick(() => {
			callRenderCoreHook(this.$refs.renderCorePage, 'handlePageShow')
		})
	}
}
</script>
