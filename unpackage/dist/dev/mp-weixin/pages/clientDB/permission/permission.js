"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {};
  },
  methods: {}
};
if (!Array) {
  const _easycom_j_link2 = common_vendor.resolveComponent("j-link");
  const _easycom_uni_list_item2 = common_vendor.resolveComponent("uni-list-item");
  (_easycom_j_link2 + _easycom_uni_list_item2)();
}
const _easycom_j_link = () => "../../../components/j-link/j-link.js";
const _easycom_uni_list_item = () => "../../../uni_modules/uni-list/components/uni-list-item/uni-list-item.js";
if (!Math) {
  (_easycom_j_link + _easycom_uni_list_item)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.p({
      text: "详情",
      url: "https://doc.dcloud.net.cn/uniCloud/uni-id/old.html"
    }),
    b: common_vendor.p({
      title: "表级-简单表达式权限控制",
      to: "../permission-table-simple/permission-table-simple",
      link: true
    }),
    c: common_vendor.p({
      title: "表级-组合表达式权限控制",
      to: "../permission-table-compound/permission-table-compound",
      link: true
    }),
    d: common_vendor.p({
      title: "字段级-简单表达式权限控制",
      to: "../permission-field-simple/permission-field-simple",
      link: true
    }),
    e: common_vendor.p({
      title: "组合表与字段级权限控制示例项目",
      to: "../permission-demo/readme",
      link: true
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/clientDB/permission/permission.js.map
