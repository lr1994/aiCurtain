"use strict";
const common_vendor = require("../../common/vendor.js");
const js_sdk_validator_validateDemo = require("../../js_sdk/validator/validate-demo.js");
const db = common_vendor._r.database();
const dbCollectionName = "validate-demo";
function getValidator(fields) {
  let reuslt = {};
  for (let key in js_sdk_validator_validateDemo.validator) {
    if (fields.indexOf(key) > -1) {
      reuslt[key] = js_sdk_validator_validateDemo.validator[key];
    }
  }
  return reuslt;
}
const _sfc_main = {
  data() {
    return {
      formData: {
        "type": -1,
        "type_name": "",
        "comment": "",
        "username": "",
        "email": "",
        "dowload_url": "",
        "weight": null,
        "favorite_book": "",
        "party_member": null,
        "hobby": [],
        "address": ""
      },
      formOptions: {
        "type_localdata": [
          {
            "text": "个人",
            "value": 0
          },
          {
            "text": "企业",
            "value": 1
          }
        ],
        "hobby_localdata": [
          {
            "text": "唱歌",
            "value": "Sing"
          },
          {
            "text": "跳舞",
            "value": "dance"
          },
          {
            "text": "画画",
            "value": "draw"
          }
        ]
      },
      rules: {
        ...getValidator(["type", "type_name", "comment", "username", "email", "dowload_url", "weight", "favorite_book", "party_member", "hobby", "address"])
      }
    };
  },
  onLoad(e) {
    const id = e.id;
    this.formDataId = id;
    this.getDetail(id);
  },
  onReady() {
    this.$refs.form.setRules(this.rules);
  },
  methods: {
    /**
     * 触发表单提交
     */
    submit() {
      common_vendor.index.showLoading({
        mask: true
      });
      this.$refs.form.submit().then((res) => {
        this.submitForm(res);
      }).catch((errors) => {
        common_vendor.index.hideLoading();
      });
    },
    submitForm(value) {
      db.collection(dbCollectionName).doc(this.formDataId).update(value).then((res) => {
        common_vendor.index.showToast({
          icon: "none",
          title: "修改成功"
        });
        this.getOpenerEventChannel().emit("refreshData");
        setTimeout(() => common_vendor.index.navigateBack(), 500);
      }).catch((err) => {
        common_vendor.index.showModal({
          content: err.message || "请求服务失败",
          showCancel: false
        });
      }).finally(() => {
        common_vendor.index.hideLoading();
      });
    },
    /**
     * 获取表单数据
     * @param {Object} id
     */
    getDetail(id) {
      common_vendor.index.showLoading({
        mask: true
      });
      db.collection(dbCollectionName).doc(id).field("type,type_name,comment,username,email,dowload_url,weight,favorite_book,party_member,hobby,address").get().then((res) => {
        const data = res.result.data[0];
        if (data) {
          this.formData = data;
        }
      }).catch((err) => {
        common_vendor.index.showModal({
          content: err.message || "请求服务失败",
          showCancel: false
        });
      }).finally(() => {
        common_vendor.index.hideLoading();
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_data_checkbox2 = common_vendor.resolveComponent("uni-data-checkbox");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_data_picker2 = common_vendor.resolveComponent("uni-data-picker");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  (_easycom_uni_data_checkbox2 + _easycom_uni_forms_item2 + _easycom_uni_easyinput2 + _easycom_uni_data_picker2 + _easycom_uni_forms2)();
}
const _easycom_uni_data_checkbox = () => "../../uni_modules/uni-data-checkbox/components/uni-data-checkbox/uni-data-checkbox.js";
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_data_picker = () => "../../uni_modules/uni-data-picker/components/uni-data-picker/uni-data-picker.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
if (!Math) {
  (_easycom_uni_data_checkbox + _easycom_uni_forms_item + _easycom_uni_easyinput + _easycom_uni_data_picker + _easycom_uni_forms)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o(($event) => $data.formData.type = $event, "90"),
    b: common_vendor.p({
      multiple: false,
      localdata: $data.formOptions.type_localdata,
      modelValue: $data.formData.type
    }),
    c: common_vendor.p({
      name: "type",
      label: "主体",
      required: true
    }),
    d: common_vendor.o(($event) => $data.formData.type_name = $event, "59"),
    e: common_vendor.p({
      placeholder: "企业输入公司名称，个人输入姓名",
      modelValue: $data.formData.type_name
    }),
    f: common_vendor.p({
      name: "type_name",
      label: "主体名称",
      required: true
    }),
    g: common_vendor.o(($event) => _ctx.binddata("comment", $event.detail.value), "09"),
    h: $data.formData.comment,
    i: common_vendor.p({
      name: "comment",
      label: "备注"
    }),
    j: common_vendor.o(($event) => $data.formData.username = $event, "42"),
    k: common_vendor.p({
      placeholder: "正则，限输入中文",
      modelValue: $data.formData.username
    }),
    l: common_vendor.p({
      name: "username",
      label: "负责人姓名"
    }),
    m: common_vendor.o(($event) => $data.formData.email = $event, "57"),
    n: common_vendor.p({
      placeholder: "邮箱",
      modelValue: $data.formData.email
    }),
    o: common_vendor.p({
      name: "email",
      label: "邮箱"
    }),
    p: common_vendor.o(($event) => $data.formData.dowload_url = $event, "b5"),
    q: common_vendor.p({
      placeholder: "如：https://uniapp.dcloud.io",
      modelValue: $data.formData.dowload_url
    }),
    r: common_vendor.p({
      name: "dowload_url",
      label: "下载地址"
    }),
    s: common_vendor.o(($event) => $data.formData.weight = $event, "d9"),
    t: common_vendor.p({
      placeholder: "限输入 >50 && <=500",
      type: "number",
      modelValue: $data.formData.weight
    }),
    v: common_vendor.p({
      name: "weight",
      label: "体重"
    }),
    w: common_vendor.o(($event) => $data.formData.favorite_book = $event, "0e"),
    x: common_vendor.p({
      collection: "book",
      field: "title as text, _id as value",
      orderby: "desc",
      modelValue: $data.formData.favorite_book
    }),
    y: common_vendor.p({
      name: "favorite_book",
      label: "喜欢的书"
    }),
    z: common_vendor.o(($event) => _ctx.binddata("party_member", $event.detail.value), "97"),
    A: $data.formData.party_member,
    B: common_vendor.p({
      name: "party_member",
      label: "是否为党员"
    }),
    C: common_vendor.o(($event) => $data.formData.hobby = $event, "21"),
    D: common_vendor.p({
      multiple: true,
      localdata: $data.formOptions.hobby_localdata,
      modelValue: $data.formData.hobby
    }),
    E: common_vendor.p({
      name: "hobby",
      label: "业余爱好"
    }),
    F: common_vendor.o(($event) => $data.formData.address = $event, "e6"),
    G: common_vendor.p({
      ["self-field"]: "code",
      ["parent-field"]: "parent_code",
      collection: "opendb-city-china",
      orderby: "value asc",
      field: "code as value, name as text",
      modelValue: $data.formData.address
    }),
    H: common_vendor.p({
      name: "address",
      label: "地址"
    }),
    I: common_vendor.o((...args) => $options.submit && $options.submit(...args), "69"),
    J: common_vendor.sr("form", "cc79e6b6-0"),
    K: common_vendor.p({
      value: $data.formData,
      ["validate-trigger"]: "submit",
      ["err-show-type"]: "toast"
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/validate-demo/edit.js.map
