"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "UniSection",
  props: {
    type: {
      type: String,
      default: ""
    },
    title: {
      type: String,
      default: ""
    },
    subTitle: {
      type: String,
      default: ""
    }
  },
  data() {
    return {};
  },
  watch: {
    title(newVal) {
      if (common_vendor.index.report && newVal !== "") {
        common_vendor.index.report("title", newVal);
      }
    }
  },
  methods: {
    onClick() {
      this.$emit("click");
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.type
  }, $props.type ? {
    b: common_vendor.n($props.type)
  } : {}, {
    c: common_vendor.t($props.title),
    d: !$props.subTitle ? 1 : "",
    e: $props.subTitle
  }, $props.subTitle ? {
    f: common_vendor.t($props.subTitle)
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-2f279ad5"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/uni-section/uni-section.js.map
