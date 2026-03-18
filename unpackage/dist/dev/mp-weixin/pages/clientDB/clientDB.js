"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {};
  },
  methods: {}
};
if (!Array) {
  const _easycom_uni_list_item2 = common_vendor.resolveComponent("uni-list-item");
  const _easycom_uni_list2 = common_vendor.resolveComponent("uni-list");
  (_easycom_uni_list_item2 + _easycom_uni_list2)();
}
const _easycom_uni_list_item = () => "../../uni_modules/uni-list/components/uni-list-item/uni-list-item.js";
const _easycom_uni_list = () => "../../uni_modules/uni-list/components/uni-list/uni-list.js";
if (!Math) {
  (_easycom_uni_list_item + _easycom_uni_list)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.p({
      title: "API操作数据库",
      note: "增删改查、分页查询、联表查询、tree查询",
      to: "./clientDB-api/clientDB-api",
      link: true
    }),
    b: common_vendor.p({
      title: "unicloud-db组件",
      note: "一个数据库查询组件，它是对clientDB的js库的再封装。前端通过组件方式直接获取uniCloud的云端数据库中的数据，并绑定在界面上进行渲染。",
      to: "./unicloud-db-demo/unicloud-db-demo",
      link: true
    }),
    c: common_vendor.p({
      title: "控制前端操作数据库的权限",
      note: "从表级,字段级根据:账户角色、权限、记录字段、账户uid等控制操作权限",
      to: "./permission/permission",
      link: true
    }),
    d: common_vendor.p({
      title: "字段值域校验",
      note: "是否必填（required）、数据类型（bsonType）、数字范围（maximum、minimum）、字符串长度范围（minLength、maxLength）、format、pattern正则表达式",
      to: "./validate/validate",
      link: true
    }),
    e: common_vendor.p({
      title: "完整示例",
      to: "./demo/demo",
      note: "结合schema的api和组件前端操作数据库,权限控制,actions、foreignKey等,做一个:不同账户权限浏览、删除、审核的系统",
      link: true
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/clientDB/clientDB.js.map
