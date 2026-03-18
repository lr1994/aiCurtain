"use strict";
const common_vendor = require("../../common/vendor.js");
function getType(val) {
  return Object.prototype.toString.call(val).slice(8, -1).toLowerCase();
}
function purifyCodes(codes) {
  codes = JSON.parse(JSON.stringify(codes));
  const codesType = getType(codes);
  switch (codesType) {
    case "object":
      if ("affectedDocs" in codes) {
        delete codes.affectedDocs;
      }
      for (let key in codes) {
        codes[key] = purifyCodes(codes[key]);
      }
      break;
    case "array":
      for (let i = 0; i < codes.length; i++) {
        codes[i] = purifyCodes(codes[i]);
      }
      break;
    default:
      return codes;
  }
  return codes;
}
const _sfc_main = {
  data() {
    return {
      codes: {},
      isShow: false
    };
  },
  methods: {
    open(codes) {
      if ("errCode" in codes) {
        try {
          delete codes.code;
          delete codes.message;
          delete codes.affectedDocs;
        } catch (e) {
        }
      }
      this.codes = purifyCodes(codes);
      this.isShow = true;
    },
    tapCode(e) {
      common_vendor.index.__f__("log", "at components/alertCode/alertCode.vue:64", e);
      e.stopPropagation();
    },
    closeMe(e) {
      this.isShow = false;
    }
  }
};
if (!Array) {
  const _easycom_show_code2 = common_vendor.resolveComponent("show-code");
  _easycom_show_code2();
}
const _easycom_show_code = () => "../show-code/show-code.js";
if (!Math) {
  _easycom_show_code();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.isShow
  }, $data.isShow ? {
    b: common_vendor.p({
      codes: $data.codes
    }),
    c: common_vendor.o((...args) => $options.tapCode && $options.tapCode(...args), "39"),
    d: common_vendor.o((...args) => $options.closeMe && $options.closeMe(...args), "25")
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-3ecbf296"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/alertCode/alertCode.js.map
