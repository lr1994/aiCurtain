"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      formData: {
        key: "",
        value: "",
        keys: "",
        msetData: ""
      }
    };
  },
  methods: {
    radioChange(e) {
      common_vendor.index.__f__("log", "at pages/cloudFunction/redis/redis.vue:49", e.target.value);
    },
    cf(action) {
      common_vendor.index.__f__("log", "at pages/cloudFunction/redis/redis.vue:52", action);
      if (!["mget", "mset"].includes(action)) {
        if (!this.formData.key) {
          return common_vendor.index.showToast({
            title: "key不能为空",
            icon: "none"
          });
        }
      }
      if (action == "set" && !this.formData.value) {
        return common_vendor.index.showToast({
          title: "value不能为空",
          icon: "none"
        });
      }
      if (action == "mget" && !this.formData.keys) {
        return common_vendor.index.showToast({
          title: "keys不能为空",
          icon: "none"
        });
      }
      if (action == "mset" && !this.formData.msetData) {
        return common_vendor.index.showToast({
          title: "msetData不能为空",
          icon: "none"
        });
      }
      common_vendor._r.callFunction({
        name: "redis-test",
        data: {
          action,
          data: this.formData
        },
        complete: (e) => {
          common_vendor.index.__f__("log", "at pages/cloudFunction/redis/redis.vue:90", e);
          this.$refs.alertCode.open(e);
        }
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_section2 = common_vendor.resolveComponent("uni-section");
  const _easycom_alertCode2 = common_vendor.resolveComponent("alertCode");
  (_easycom_uni_section2 + _easycom_alertCode2)();
}
const _easycom_uni_section = () => "../../../components/uni-section/uni-section.js";
const _easycom_alertCode = () => "../../../components/alertCode/alertCode.js";
if (!Math) {
  (_easycom_uni_section + _easycom_alertCode)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.p({
      title: "存储字符串数据",
      type: "line"
    }),
    b: $data.formData.key,
    c: common_vendor.o(($event) => $data.formData.key = $event.detail.value, "e6"),
    d: $data.formData.value,
    e: common_vendor.o(($event) => $data.formData.value = $event.detail.value, "48"),
    f: common_vendor.o(($event) => $options.cf("set"), "ec"),
    g: common_vendor.o(($event) => $options.cf("get"), "c1"),
    h: common_vendor.o(($event) => $options.cf("del"), "84"),
    i: common_vendor.p({
      title: "批量操作",
      subTitle: "用,号隔开多个值",
      type: "line"
    }),
    j: $data.formData.keys,
    k: common_vendor.o(($event) => $data.formData.keys = $event.detail.value, "8e"),
    l: common_vendor.o(($event) => $options.cf("mget"), "49"),
    m: $data.formData.msetData,
    n: common_vendor.o(($event) => $data.formData.msetData = $event.detail.value, "57"),
    o: common_vendor.o(($event) => $options.cf("mset"), "b6"),
    p: common_vendor.sr("alertCode", "ff4b88e2-2")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/cloudFunction/redis/redis.js.map
