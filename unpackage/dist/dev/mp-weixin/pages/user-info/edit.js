"use strict";
const common_vendor = require("../../common/vendor.js");
const js_sdk_validator_userInfo = require("../../js_sdk/validator/user-info.js");
const db = common_vendor._r.database();
const dbCollectionName = "user-info";
function getValidator(fields) {
  let result = {};
  for (let key in js_sdk_validator_userInfo.validator) {
    if (fields.indexOf(key) > -1) {
      result[key] = js_sdk_validator_userInfo.validator[key];
    }
  }
  return result;
}
const _sfc_main = {
  data() {
    let formData = {
      "username": "",
      "gender": 0,
      "birth_date": null,
      "weight": null,
      "mobile": "",
      "email": "",
      "url": "",
      "favorite_book_id": "",
      "address_code": "",
      "party_member": null,
      "hobby": [],
      "comment": ""
    };
    return {
      formData,
      formOptions: {
        "gender_localdata": [
          {
            "text": "未知",
            "value": 0
          },
          {
            "text": "男",
            "value": 1
          },
          {
            "text": "女",
            "value": 2
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
        ...getValidator(Object.keys(formData))
      }
    };
  },
  onLoad(e) {
    if (e.id) {
      const id = e.id;
      this.formDataId = id;
      this.getDetail(id);
    }
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
      this.$refs.form.validate().then((res) => {
        this.submitForm(res);
      }).catch(() => {
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
      db.collection(dbCollectionName).doc(id).field("username,gender,birth_date,weight,mobile,email,url,favorite_book_id,address_code,party_member,hobby,comment").get().then((res) => {
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
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_data_checkbox2 = common_vendor.resolveComponent("uni-data-checkbox");
  const _easycom_uni_datetime_picker2 = common_vendor.resolveComponent("uni-datetime-picker");
  const _easycom_uni_data_picker2 = common_vendor.resolveComponent("uni-data-picker");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  (_easycom_uni_easyinput2 + _easycom_uni_forms_item2 + _easycom_uni_data_checkbox2 + _easycom_uni_datetime_picker2 + _easycom_uni_data_picker2 + _easycom_uni_forms2)();
}
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_forms_item = () => "../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_data_checkbox = () => "../../uni_modules/uni-data-checkbox/components/uni-data-checkbox/uni-data-checkbox.js";
const _easycom_uni_datetime_picker = () => "../../uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.js";
const _easycom_uni_data_picker = () => "../../uni_modules/uni-data-picker/components/uni-data-picker/uni-data-picker.js";
const _easycom_uni_forms = () => "../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
if (!Math) {
  (_easycom_uni_easyinput + _easycom_uni_forms_item + _easycom_uni_data_checkbox + _easycom_uni_datetime_picker + _easycom_uni_data_picker + _easycom_uni_forms)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o(($event) => $data.formData.username = $event, "6e"),
    b: common_vendor.p({
      placeholder: "限制只能输入中文",
      modelValue: $data.formData.username
    }),
    c: common_vendor.p({
      name: "username",
      label: "真实姓名"
    }),
    d: common_vendor.o(($event) => $data.formData.gender = $event, "f3"),
    e: common_vendor.p({
      localdata: $data.formOptions.gender_localdata,
      modelValue: $data.formData.gender
    }),
    f: common_vendor.p({
      name: "gender",
      label: "性别"
    }),
    g: common_vendor.o(($event) => $data.formData.birth_date = $event, "50"),
    h: common_vendor.p({
      ["return-type"]: "timestamp",
      modelValue: $data.formData.birth_date
    }),
    i: common_vendor.p({
      name: "birth_date",
      label: "生日"
    }),
    j: common_vendor.o(($event) => $data.formData.weight = $event, "90"),
    k: common_vendor.p({
      placeholder: "限输入 >50 && <=500",
      type: "number",
      modelValue: $data.formData.weight
    }),
    l: common_vendor.p({
      name: "weight",
      label: "体重"
    }),
    m: common_vendor.o(($event) => $data.formData.mobile = $event, "26"),
    n: common_vendor.p({
      placeholder: "手机号码",
      modelValue: $data.formData.mobile
    }),
    o: common_vendor.p({
      name: "mobile",
      label: "手机号码"
    }),
    p: common_vendor.o(($event) => $data.formData.email = $event, "77"),
    q: common_vendor.p({
      placeholder: "请输入你的邮箱账号",
      modelValue: $data.formData.email
    }),
    r: common_vendor.p({
      name: "email",
      label: "邮箱账号"
    }),
    s: common_vendor.o(($event) => $data.formData.url = $event, "73"),
    t: common_vendor.p({
      placeholder: "请输入网址的地址",
      modelValue: $data.formData.url
    }),
    v: common_vendor.p({
      name: "url",
      label: "个人博客"
    }),
    w: common_vendor.o(($event) => $data.formData.favorite_book_id = $event, "9e"),
    x: common_vendor.p({
      collection: "book",
      field: "title as text, _id as value",
      orderby: "desc",
      modelValue: $data.formData.favorite_book_id
    }),
    y: common_vendor.p({
      name: "favorite_book_id",
      label: "喜欢的书"
    }),
    z: common_vendor.o(($event) => $data.formData.address_code = $event, "63"),
    A: common_vendor.p({
      ["self-field"]: "code",
      ["parent-field"]: "parent_code",
      collection: "opendb-city-china",
      orderby: "value asc",
      field: "code as value, name as text",
      modelValue: $data.formData.address_code
    }),
    B: common_vendor.p({
      name: "address_code",
      label: "地址"
    }),
    C: common_vendor.o(($event) => _ctx.binddata("party_member", $event.detail.value), "8e"),
    D: $data.formData.party_member,
    E: common_vendor.p({
      name: "party_member",
      label: "是否为党员"
    }),
    F: common_vendor.o(($event) => $data.formData.hobby = $event, "72"),
    G: common_vendor.p({
      multiple: "true",
      multiple: true,
      localdata: $data.formOptions.hobby_localdata,
      modelValue: $data.formData.hobby
    }),
    H: common_vendor.p({
      name: "hobby",
      label: "业余爱好"
    }),
    I: common_vendor.o([($event) => $data.formData.comment = $event.detail.value, ($event) => _ctx.binddata("comment", $event.detail.value)], "9d"),
    J: $data.formData.comment,
    K: common_vendor.p({
      name: "comment",
      label: "备注"
    }),
    L: common_vendor.o((...args) => $options.submit && $options.submit(...args), "aa"),
    M: common_vendor.sr("form", "2e46232f-0"),
    N: common_vendor.p({
      value: $data.formData,
      ["validate-trigger"]: "submit",
      ["err-show-type"]: "toast"
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user-info/edit.js.map
