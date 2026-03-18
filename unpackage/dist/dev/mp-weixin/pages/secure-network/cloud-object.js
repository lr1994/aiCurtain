"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      inputValue: "uniCloud-secure-network"
    };
  },
  methods: {
    getBySecretType(secretType) {
      common_vendor.index.showLoading({
        title: "处理中..."
      });
      const secureNetworkObject = common_vendor._r.importObject("secure-network-object", {
        secretMethods: {
          "get": secretType
        }
      });
      secureNetworkObject.get(this.inputValue).then((res) => {
        common_vendor.index.hideLoading();
        common_vendor.index.showModal({
          content: JSON.stringify(res),
          showCancel: false
        });
      }).catch((err) => {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/secure-network/cloud-object.vue:73", err);
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.inputValue,
    b: common_vendor.o(($event) => $data.inputValue = $event.detail.value, "da"),
    c: common_vendor.o(($event) => $options.getBySecretType("both"), "32"),
    d: common_vendor.o(($event) => $options.getBySecretType("request"), "d5"),
    e: common_vendor.o(($event) => $options.getBySecretType("response"), "8d")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/secure-network/cloud-object.js.map
