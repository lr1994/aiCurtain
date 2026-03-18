"use strict";
const common_vendor = require("../../../common/vendor.js");
const js_sdk_validator_permissionTest = require("../../../js_sdk/validator/permission-test.js");
const db = common_vendor._r.database();
db.command;
const dbCollectionName = "permission-test";
function getValidator(fields) {
  let reuslt = {};
  for (let key in js_sdk_validator_permissionTest.validator) {
    if (fields.indexOf(key) > -1) {
      reuslt[key] = js_sdk_validator_permissionTest.validator[key];
    }
  }
  return reuslt;
}
const _sfc_main = {
  data() {
    return {
      formData: {
        "_id": false,
        "nickname": "",
        "username": "",
        "state": 0,
        "phone": ""
      },
      formOptions: {},
      rules: {
        ...getValidator(["nickname", "username", "state", "phone"])
      },
      stateOption: [
        //	{text:"审核中",value:0},
        {
          text: "审核通过",
          value: 1
        },
        {
          text: "审核拒绝",
          value: -1
        }
      ],
      rulo_index: 0,
      role: ""
    };
  },
  mounted() {
    this.$refs["set-permission"].init(1);
  },
  computed: {
    states() {
      let _text;
      [
        {
          text: "审核中",
          value: 0
        },
        {
          text: "审核通过",
          value: 1
        },
        {
          text: "审核拒绝",
          value: -1
        }
      ].forEach(({
        text,
        value
      }) => {
        if (value == this.formData.state) {
          _text = text;
        }
      });
      return "当前为" + _text + "状态。\n";
    }
  },
  methods: {
    setState(e) {
      common_vendor.index.__f__("log", "at pages/clientDB/permission-demo/permission-demo.vue:122", e.detail.value, dbCollectionName);
      db.collection(dbCollectionName).update({
        state: e.detail.value
      }).then((res) => {
        common_vendor.index.__f__("log", "at pages/clientDB/permission-demo/permission-demo.vue:126", "res: ", res);
        this.formData.state = e.detail.value;
        common_vendor.index.showToast({
          icon: "none",
          title: "更新成功"
        });
      }).catch((err) => {
        common_vendor.index.__f__("log", "at pages/clientDB/permission-demo/permission-demo.vue:133", JSON.stringify(err));
        common_vendor.index.showModal({
          content: err.message || "请求服务失败",
          showCancel: false
        });
      }).finally(() => {
        common_vendor.index.hideLoading();
      });
    },
    showTip() {
      common_vendor.index.showToast({
        title: "审核中不能编辑",
        icon: "none"
      });
    },
    changePermission({ role, index }) {
      common_vendor.index.__f__("log", "at pages/clientDB/permission-demo/permission-demo.vue:149", "index", index);
      common_vendor.index.__f__("log", "at pages/clientDB/permission-demo/permission-demo.vue:150", "role", role);
      this.role = role;
      this.rulo_index = index;
      let field = "_id,username,nickname,state";
      let where = {};
      if (index > 0) {
        field += ",phone";
      }
      if (index == 1) {
        where = "uid == $env.uid";
      }
      db.collection("permission-test").where(where).field(field).get().then((e) => {
        common_vendor.index.__f__("log", "at pages/clientDB/permission-demo/permission-demo.vue:164", e);
        if (e.result.data[0]) {
          this.formData = e.result.data[0];
        } else {
          common_vendor.index.showLoading({
            title: "正在初始化数据",
            mask: false
          });
          this.addDefaultData();
        }
      }).catch((errors) => {
        common_vendor.index.__f__("log", "at pages/clientDB/permission-demo/permission-demo.vue:175", errors);
        common_vendor.index.hideLoading();
      });
    },
    /**
     * 触发表单提交
     */
    submit() {
      common_vendor.index.showLoading({
        mask: true
      });
      this.$refs.form.submit().then((res) => {
        this.submitForm(res);
      }).catch((e) => {
        common_vendor.index.hideLoading();
      });
    },
    addDefaultData() {
      common_vendor.index.__f__("log", "at pages/clientDB/permission-demo/permission-demo.vue:193", "dbCollectionName: ", dbCollectionName);
      db.collection(dbCollectionName).add({
        "nickname": "默认昵称",
        "username": "默认姓名",
        "phone": "1888888888"
      }).then((res) => {
        common_vendor.index.__f__("log", "at pages/clientDB/permission-demo/permission-demo.vue:199", res);
        this.formData._id = res.result.id;
        common_vendor.index.showToast({
          icon: "none",
          title: "新增成功"
        });
        this.$refs["set-permission"].init(0);
      }).catch((err) => {
        common_vendor.index.__f__("log", "at pages/clientDB/permission-demo/permission-demo.vue:207", err);
        common_vendor.index.showModal({
          content: err.message || "请求服务失败",
          showCancel: false
        });
      }).finally(() => {
        common_vendor.index.hideLoading();
      });
    },
    submitForm(value) {
      if (this.formData._id) {
        common_vendor.index.__f__("log", "at pages/clientDB/permission-demo/permission-demo.vue:219", this.formData.state);
        if (this.formData.state === 0) {
          delete value.username;
        }
        if (this.rulo_index <= 1) {
          delete value.state;
        }
        common_vendor.index.__f__("log", "at pages/clientDB/permission-demo/permission-demo.vue:226", value);
        db.action("permission_test_update").collection(dbCollectionName).where("uid == $env.uid").update(value).then((res) => {
          common_vendor.index.__f__("log", "at pages/clientDB/permission-demo/permission-demo.vue:232", JSON.stringify(res.result));
          if (this.rulo_index <= 1 && res.result.changeState) {
            this.formData.state = 0;
          }
          common_vendor.index.showToast({
            icon: "none",
            title: "更新成功"
          });
        }).catch((err) => {
          common_vendor.index.__f__("log", "at pages/clientDB/permission-demo/permission-demo.vue:241", JSON.stringify(err));
          common_vendor.index.showModal({
            content: err.message || "请求服务失败",
            showCancel: false
          });
        }).finally(() => {
          common_vendor.index.hideLoading();
        });
      } else {
        common_vendor.index.__f__("log", "at pages/clientDB/permission-demo/permission-demo.vue:250", "err 9527");
      }
    }
  }
};
if (!Array) {
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_data_checkbox2 = common_vendor.resolveComponent("uni-data-checkbox");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  const _easycom_set_permission2 = common_vendor.resolveComponent("set-permission");
  (_easycom_uni_easyinput2 + _easycom_uni_forms_item2 + _easycom_uni_data_checkbox2 + _easycom_uni_forms2 + _easycom_set_permission2)();
}
const _easycom_uni_easyinput = () => "../../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_forms_item = () => "../../../uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_data_checkbox = () => "../../../uni_modules/uni-data-checkbox/components/uni-data-checkbox/uni-data-checkbox.js";
const _easycom_uni_forms = () => "../../../uni_modules/uni-forms/components/uni-forms/uni-forms.js";
const _easycom_set_permission = () => "../../../components/set-permission/set-permission.js";
if (!Math) {
  (_easycom_uni_easyinput + _easycom_uni_forms_item + _easycom_uni_data_checkbox + _easycom_uni_forms + _easycom_set_permission)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o(($event) => $data.formData.nickname = $event, "b4"),
    b: common_vendor.p({
      disabled: $data.rulo_index != 1,
      modelValue: $data.formData.nickname
    }),
    c: common_vendor.p({
      name: "nickname",
      label: "昵称"
    }),
    d: common_vendor.o(($event) => $data.formData.state == 0 ? $options.showTip() : "", "e2"),
    e: common_vendor.o(($event) => $data.formData.username = $event, "6c"),
    f: common_vendor.p({
      disabled: $data.rulo_index != 1 || $data.formData.state == 0,
      modelValue: $data.formData.username
    }),
    g: common_vendor.p({
      name: "username",
      label: "姓名"
    }),
    h: $data.rulo_index > 0
  }, $data.rulo_index > 0 ? common_vendor.e({
    i: $data.rulo_index > 1
  }, $data.rulo_index > 1 ? {
    j: common_vendor.o($options.setState, "10"),
    k: common_vendor.p({
      value: $data.formData.state,
      multiple: false,
      localdata: $data.stateOption
    })
  } : {}, {
    l: common_vendor.t($options.states),
    m: $data.rulo_index == 1
  }, $data.rulo_index == 1 ? common_vendor.e({
    n: $data.formData.state
  }, $data.formData.state ? {} : {}) : {}, {
    o: $data.rulo_index > 1
  }, $data.rulo_index > 1 ? common_vendor.e({
    p: $data.formData.state
  }, $data.formData.state ? {} : {}) : {}, {
    q: common_vendor.p({
      name: "state",
      label: "状态"
    })
  }) : {}, {
    r: $data.formData.phone
  }, $data.formData.phone ? {
    s: common_vendor.o(($event) => $data.formData.phone = $event, "57"),
    t: common_vendor.p({
      disabled: !$data.rulo_index === 1,
      modelValue: $data.formData.phone
    })
  } : {}, {
    v: common_vendor.p({
      name: "phone",
      label: "电话"
    }),
    w: $data.rulo_index === 1 && $data.formData._id
  }, $data.rulo_index === 1 && $data.formData._id ? {
    x: common_vendor.o((...args) => $options.submit && $options.submit(...args), "5a")
  } : {}, {
    y: common_vendor.sr("form", "c5a257da-0"),
    z: common_vendor.p({
      value: $data.formData,
      ["validate-trigger"]: "submit",
      ["err-show-type"]: "toast"
    }),
    A: common_vendor.sr("set-permission", "c5a257da-9"),
    B: common_vendor.o($options.changePermission, "ce")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/clientDB/permission-demo/permission-demo.js.map
