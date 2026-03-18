"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  methods: {
    navigator() {
      common_vendor.index.navigateTo({
        url: "/pages/webview/webview?url=" + this.url
      });
    }
  },
  props: {
    url: {
      type: String,
      default() {
        return "";
      }
    },
    text: {
      type: String,
      default() {
        return "";
      }
    },
    color: {
      type: String,
      default() {
        return "#586b95";
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($props.text),
    b: common_vendor.o((...args) => $options.navigator && $options.navigator(...args), "46"),
    c: $props.color
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/j-link/j-link.js.map
