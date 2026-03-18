"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
var videoContext;
const _sfc_main = {
  mounted() {
    videoContext = common_vendor.index.createVideoContext("myVideo", this);
  },
  computed: {
    posterUrl() {
      if (this.poster)
        return this.poster;
      return this.src + "?x-oss-process=video/snapshot,t_" + parseInt(this.currentTime * 1e3) + ",f_jpg,w_800,m_fast";
    }
  },
  methods: {
    fullscreenchange(e) {
      common_vendor.index.__f__("log", "at components/j-video/j-video.vue:31", e.detail.fullScreen);
      this.state = e.detail.fullScreen;
      if (!e.detail.fullScreen) {
        videoContext.pause();
      }
    },
    timeupdate(e) {
      this.duration = e.detail.duration;
      this.currentTime = e.detail.currentTime;
    },
    play() {
      videoContext.play();
      videoContext.requestFullScreen({ direction: this.direction });
    }
  },
  watch: {},
  data() {
    return {
      state: false,
      currentTime: 0,
      duration: 0,
      videoId: ""
    };
  },
  props: {
    poster: {
      type: [String, Boolean],
      default() {
        return "https://web-assets.dcloud.net.cn/unidoc/zh/schema2code-poster.jpg";
      }
    },
    src: {
      type: String,
      default() {
        return "";
      }
    },
    title: {
      type: String,
      default() {
        return "";
      }
    },
    direction: {
      type: Number,
      default() {
        return -90;
      }
    },
    width: {
      type: String,
      default() {
        return "750rpx";
      }
    },
    height: {
      type: String,
      default() {
        return "450rpx";
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $props.width,
    b: $props.height,
    c: $options.posterUrl,
    d: common_assets._imports_0$3,
    e: $props.width,
    f: $props.height,
    g: common_vendor.o((...args) => $options.play && $options.play(...args), "a2"),
    h: $props.src,
    i: common_vendor.o((...args) => $options.timeupdate && $options.timeupdate(...args), "ee"),
    j: common_vendor.o((...args) => $options.fullscreenchange && $options.fullscreenchange(...args), "4d"),
    k: $props.width,
    l: $props.height
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-c6e2e182"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/j-video/j-video.js.map
