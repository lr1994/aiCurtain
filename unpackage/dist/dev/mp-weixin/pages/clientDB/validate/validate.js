"use strict";
const common_vendor = require("../../../common/vendor.js");
const myForm = () => "../../validate-demo/add2.js";
const _sfc_main = {
  components: {
    myForm
  },
  data() {
    return {
      items: ["实例demo", "值校验文档", "域校验文档"],
      current: 0
    };
  },
  methods: {
    clickItem(e) {
      common_vendor.index.__f__("log", "at pages/clientDB/validate/validate.vue:64", e);
      this.current = e.currentIndex;
    }
  }
};
if (!Array) {
  const _easycom_uni_segmented_control2 = common_vendor.resolveComponent("uni-segmented-control");
  const _component_myForm = common_vendor.resolveComponent("myForm");
  const _easycom_uni_section2 = common_vendor.resolveComponent("uni-section");
  const _easycom_uni_list_item2 = common_vendor.resolveComponent("uni-list-item");
  const _easycom_uni_list2 = common_vendor.resolveComponent("uni-list");
  (_easycom_uni_segmented_control2 + _component_myForm + _easycom_uni_section2 + _easycom_uni_list_item2 + _easycom_uni_list2)();
}
const _easycom_uni_segmented_control = () => "../../../uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.js";
const _easycom_uni_section = () => "../../../components/uni-section/uni-section.js";
const _easycom_uni_list_item = () => "../../../uni_modules/uni-list/components/uni-list-item/uni-list-item.js";
const _easycom_uni_list = () => "../../../uni_modules/uni-list/components/uni-list/uni-list.js";
if (!Math) {
  (_easycom_uni_segmented_control + _easycom_uni_section + _easycom_uni_list_item + _easycom_uni_list)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o($options.clickItem, "df"),
    b: common_vendor.p({
      current: $data.current,
      values: $data.items
    }),
    c: $data.current === 0,
    d: common_vendor.p({
      title: "函数验证器 validateFunction",
      type: "line"
    }),
    e: common_vendor.p({
      title: "表级跨字段动态验证",
      rightText: "主体名称",
      note: "这是一种可跨字段的表级验证器,会随着表中其中一个字段的值改变另一个字段的验证规则;如:主体为企业、个人时分别设置验证规则。\\n 个人:最多输入5个字;企业:最少输入4个字。\\n 你可以尝试切换不同的主体类型,输入主体名称测试"
    }),
    f: common_vendor.p({
      title: "可联网的验证",
      rightText: "备注",
      note: "典型功能:敏感词过滤.需要连网调用api验证。"
    }),
    g: common_vendor.p({
      title: "常规验证 pattern",
      type: "line"
    }),
    h: common_vendor.p({
      title: "正则验证",
      rightText: "姓名",
      note: "通过正则表达式满足各类验证需求"
    }),
    i: common_vendor.p({
      title: "内置验证器format",
      type: "line"
    }),
    j: common_vendor.p({
      title: "邮箱、网址",
      note: "后续会持续新增",
      rightText: "email、url"
    }),
    k: common_vendor.p({
      title: "数据类型 bsonType",
      type: "line"
    }),
    l: common_vendor.p({
      title: "整数",
      note: "数值框,如本示例中的体重",
      rightText: "int"
    }),
    m: common_vendor.p({
      title: "数组",
      note: "如:单选/多选框,如本示例中的喜欢的书和体重",
      rightText: "array"
    }),
    n: common_vendor.p({
      title: "布尔值",
      note: "如:开关switch,如本示例中的是否党员",
      rightText: "bool"
    }),
    o: common_vendor.p({
      title: "数值规范",
      type: "line"
    }),
    p: common_vendor.p({
      title: "数值范围",
      note: "最大值:maximum,最小值minimum \\n 含最大值exclusiveMaximum,含最小值exclusiveMinimum"
    }),
    q: common_vendor.p({
      title: "字符串长度",
      note: "maxLength限输入的文本长度不超过10"
    }),
    r: common_vendor.p({
      title: "是否必填",
      note: "required:[type, type_name]列举必填字段",
      rightText: "文本框、slider"
    }),
    s: $data.current === 1,
    t: common_vendor.p({
      title: "enum完全列举",
      type: "line"
    }),
    v: common_vendor.p({
      title: "完全列举范围",
      note: "enum支持三种类型:简单数组、支持描述的复杂数组、数据查询; \\n schema2code不支持简单数组",
      rightText: "多选单选框"
    }),
    w: common_vendor.p({
      title: "来源数据查询",
      note: "一个数据查询而来。也即，在enum中可以配置jql查询语句。本示例的地址就是从表opendb-city-china中查询",
      rightText: "地址"
    }),
    x: common_vendor.p({
      title: "设置变量的值",
      type: "line"
    }),
    y: common_vendor.p({
      title: "预置字段值 defaultValue",
      note: "为字段设置默认值，可用schema直接修改",
      rightText: ""
    }),
    z: common_vendor.p({
      title: "强制字段值 forceDefaultValue",
      note: "强制设置字段值,无法用schema直接修改;但可以通过云函数(含action)修改。支持插入:当前时间戳、当前客户端IP、当前用户Id。",
      rightText: ""
    }),
    A: $data.current === 2
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-745068e6"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/clientDB/validate/validate.js.map
