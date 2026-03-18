"use strict";
const common_vendor = require("../../../../common/vendor.js");
const uni_modules_uniUpgradeCenter_pages_mixin_version_add_detail_mixin = require("../mixin/version_add_detail_mixin.js");
const uni_modules_uniUpgradeCenter_pages_utils = require("../utils.js");
const showInfo = () => "../components/show-info.js";
const db = common_vendor._r.database();
db.command;
const dbCollectionName = uni_modules_uniUpgradeCenter_pages_utils.appVersionListDbName;
const platform_iOS = "iOS";
const platform_Android = "Android";
function compare(v1 = "0", v2 = "0") {
  v1 = String(v1).split(".");
  v2 = String(v2).split(".");
  const minVersionLens = Math.min(v1.length, v2.length);
  let result = 0;
  for (let i = 0; i < minVersionLens; i++) {
    const curV1 = Number(v1[i]);
    const curV2 = Number(v2[i]);
    if (curV1 > curV2) {
      result = 1;
      break;
    } else if (curV1 < curV2) {
      result = -1;
      break;
    }
  }
  if (result === 0 && v1.length !== v2.length) {
    const v1BiggerThenv2 = v1.length > v2.length;
    const maxLensVersion = v1BiggerThenv2 ? v1 : v2;
    for (let i = minVersionLens; i < maxLensVersion.length; i++) {
      const curVersion = Number(maxLensVersion[i]);
      if (curVersion > 0) {
        v1BiggerThenv2 ? result = 1 : result = -1;
        break;
      }
    }
  }
  return result;
}
const _sfc_main = {
  components: {
    showInfo
  },
  mixins: [uni_modules_uniUpgradeCenter_pages_mixin_version_add_detail_mixin.addAndDetail],
  data() {
    return {
      latestVersion: "0.0.0",
      lastVersionId: ""
    };
  },
  async onLoad({
    appid,
    name,
    type
  }) {
    if (appid && type && name) {
      this.formData = {
        ...this.formData,
        ...{
          appid,
          name,
          type
          // store_list
        }
      };
      this.latestStableData = await this.getDetail(appid, type);
      if (!this.isWGT && this.latestStableData.length) {
        this.setFormData(platform_Android);
      }
      if (this.isWGT) {
        this.rules.min_uni_version.rules.push({
          "required": true
        });
      }
    }
  },
  watch: {
    isiOS(val) {
      if (val) {
        this.setFormData(platform_iOS);
        return;
      } else if (this.hasPackage) {
        this.formData.url = this.appFileList.url;
        return;
      }
      this.formData.url = "";
    },
    "formData.platform"(val) {
      if (this.isWGT) {
        this.setFormData(val);
      }
    }
  },
  methods: {
    setFormData(os) {
      common_vendor.index.showLoading({
        mask: true
      });
      this.latestVersion = "0.0.0";
      this.lastVersionId = "";
      const data = this.getData(this.latestStableData, os)[0];
      if (data) {
        const {
          _id,
          version,
          name,
          platform,
          min_uni_version,
          url
        } = data;
        this.lastVersionId = _id;
        this.latestVersion = version;
        this.formData.name = name;
        if (!this.isWGT) {
          delete this.formData.min_uni_version;
          this.formData.platform = platform[0];
          if (this.isiOS) {
            this.formData.url = url;
          }
        } else {
          this.formData.min_uni_version = min_uni_version;
        }
      } else if (this.isWGT) {
        this.formData.min_uni_version = "";
      }
      common_vendor.index.hideLoading();
    },
    /**
     * 触发表单提交
     */
    submit() {
      if (!this.formData.url && this.isiOS) {
        common_vendor.index.showToast({
          icon: "error",
          title: "AppStore 链接必填"
        });
        return;
      }
      common_vendor.index.showLoading({
        mask: true
      });
      this.$refs.form.validate().then((res) => {
        res.url = this.formData.url;
        if (compare(this.latestVersion, res.version) >= 0) {
          common_vendor.index.showModal({
            content: `版本号必须大于当前已上线版本（${this.latestVersion}）`,
            showCancel: false
          });
          throw new Error("版本号必须大于已上线版本（${this.latestVersion}）");
        }
        if (!this.isWGT) {
          res.platform = [res.platform];
        }
        if (this.isiOS || this.isWGT)
          delete res.store_list;
        if (res.store_list) {
          res.store_list.forEach((item) => {
            item.priority = parseFloat(item.priority);
          });
        }
        this.submitForm(res);
      }).catch((errors) => {
        common_vendor.index.hideLoading();
      });
    },
    async submitForm(value) {
      value = this.createCenterRecord(value);
      const collectionDB = db.collection(dbCollectionName);
      let recordCreateByUniStat = [];
      if (!this.isWGT) {
        recordCreateByUniStat = await this.getDetail(value.appid, value.type, this.createStatQuery(value));
      }
      let dbOperate;
      if (!recordCreateByUniStat.length) {
        dbOperate = collectionDB.add(value);
      } else {
        value.create_date = Date.now();
        dbOperate = collectionDB.doc(recordCreateByUniStat[0]._id).update(value);
      }
      dbOperate.then(async (res) => {
        if (value.stable_publish && this.lastVersionId) {
          await collectionDB.doc(this.lastVersionId).update({
            stable_publish: false
          });
        }
        common_vendor.index.showToast({
          title: "新增成功"
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
    getDetail(appid, type, args = {}) {
      common_vendor.index.showLoading({
        mask: true
      });
      return db.collection(dbCollectionName).where(
        Object.assign({
          appid,
          type,
          stable_publish: true
        }, args)
      ).field(uni_modules_uniUpgradeCenter_pages_mixin_version_add_detail_mixin.fields).get().then((res) => res.result.data).catch((err) => {
        common_vendor.index.showModal({
          content: err.message || "请求服务失败",
          showCancel: false
        });
      }).finally(() => {
        common_vendor.index.hideLoading();
      });
    },
    getStoreList(appid) {
      return db.collection("opendb-app-list").where({
        appid
      }).get().then((res) => {
        const data = res.result.data[0];
        return data.store_list || [];
      });
    },
    getData(data = [], platform) {
      if (typeof platform === "string") {
        return data.filter((item) => item.platform.includes(platform));
      } else {
        return data.filter((item) => item.platform.toString() === platform.toString());
      }
    },
    back() {
      common_vendor.index.showModal({
        title: "取消发布",
        content: this.hasPackage ? "将会删除已上传的包" : void 0,
        success: (res) => {
          if (res.confirm) {
            if (this.hasPackage) {
              let fileList = [];
              fileList.push(this.appFileList.url);
              this.$request("deleteFile", {
                fileList
              }, {
                functionName: "upgrade-center"
              });
            }
            common_vendor.index.navigateBack();
          }
        }
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_data_checkbox2 = common_vendor.resolveComponent("uni-data-checkbox");
  const _component_show_info = common_vendor.resolveComponent("show-info");
  const _easycom_uni_file_picker2 = common_vendor.resolveComponent("uni-file-picker");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  (_easycom_uni_easyinput2 + _easycom_uni_forms_item2 + _easycom_uni_data_checkbox2 + _component_show_info + _easycom_uni_file_picker2 + _easycom_uni_forms2)();
}
const _easycom_uni_easyinput = () => "../../../uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_forms_item = () => "../../../uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_data_checkbox = () => "../../../uni-data-checkbox/components/uni-data-checkbox/uni-data-checkbox.js";
const _easycom_uni_file_picker = () => "../../../uni-file-picker/components/uni-file-picker/uni-file-picker.js";
const _easycom_uni_forms = () => "../../../uni-forms/components/uni-forms/uni-forms.js";
if (!Math) {
  (_easycom_uni_easyinput + _easycom_uni_forms_item + _easycom_uni_data_checkbox + _easycom_uni_file_picker + _easycom_uni_forms)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t(_ctx.type_valuetotext[_ctx.formData.type]),
    b: common_vendor.o(($event) => _ctx.formData.appid = $event, "13"),
    c: common_vendor.p({
      disabled: true,
      trim: "both",
      modelValue: _ctx.formData.appid
    }),
    d: common_vendor.p({
      name: "appid",
      label: "AppID",
      required: true
    }),
    e: common_vendor.o(($event) => _ctx.formData.name = $event, "ac"),
    f: common_vendor.p({
      disabled: true,
      trim: "both",
      modelValue: _ctx.formData.name
    }),
    g: common_vendor.p({
      name: "name",
      label: "应用名称"
    }),
    h: common_vendor.o(($event) => _ctx.formData.title = $event, "a0"),
    i: common_vendor.p({
      placeholder: "更新标题",
      modelValue: _ctx.formData.title
    }),
    j: common_vendor.p({
      name: "title",
      label: "更新标题"
    }),
    k: common_vendor.o(($event) => _ctx.binddata("contents", $event.detail.value), "e5"),
    l: _ctx.formData.contents,
    m: common_vendor.o((val) => _ctx.formData.contents = val, "ce"),
    n: common_vendor.p({
      name: "contents",
      label: "更新内容",
      required: true
    }),
    o: common_vendor.o(($event) => _ctx.formData.platform = $event, "32"),
    p: common_vendor.p({
      multiple: _ctx.isWGT,
      localdata: _ctx.platformLocaldata,
      modelValue: _ctx.formData.platform
    }),
    q: common_vendor.p({
      name: "platform",
      label: "平台",
      required: true
    }),
    r: common_vendor.o(($event) => _ctx.formData.version = $event, "70"),
    s: common_vendor.p({
      placeholder: "当前包版本号，必须大于当前线上发行版本号",
      modelValue: _ctx.formData.version
    }),
    t: common_vendor.p({
      name: "version",
      label: "版本号",
      required: true
    }),
    v: _ctx.isWGT
  }, _ctx.isWGT ? {
    w: common_vendor.o(($event) => _ctx.formData.min_uni_version = $event, "a5"),
    x: common_vendor.p({
      placeholder: "原生App最低版本",
      modelValue: _ctx.formData.min_uni_version
    }),
    y: common_vendor.p({
      content: _ctx.minUniVersionContent
    }),
    z: common_vendor.p({
      name: "min_uni_version",
      label: "原生App最低版本",
      required: _ctx.isWGT
    })
  } : {}, {
    A: !_ctx.isiOS
  }, !_ctx.isiOS ? common_vendor.e({
    B: common_vendor.o((...args) => _ctx.selectFile && _ctx.selectFile(...args), "02"),
    C: common_vendor.o(_ctx.packageUploadSuccess, "e5"),
    D: common_vendor.o(_ctx.packageDelete, "02"),
    E: common_vendor.o(($event) => _ctx.appFileList = $event, "49"),
    F: common_vendor.p({
      ["file-extname"]: _ctx.fileExtname,
      disabled: _ctx.hasPackage,
      returnType: "object",
      ["file-mediatype"]: "all",
      limit: "1",
      modelValue: _ctx.appFileList
    }),
    G: _ctx.hasPackage
  }, _ctx.hasPackage ? {
    H: common_vendor.t(Number(_ctx.appFileList.size / 1024 / 1024).toFixed(2))
  } : {}, {
    I: common_vendor.p({
      label: "上传apk包"
    })
  }) : {}, {
    J: common_vendor.o(($event) => _ctx.formData.url = $event, "0b"),
    K: common_vendor.p({
      placeholder: "可下载安装包地址",
      maxlength: -1,
      modelValue: _ctx.formData.url
    }),
    L: common_vendor.p({
      top: -80,
      content: _ctx.uploadFileContent
    }),
    M: common_vendor.p({
      name: "url",
      label: _ctx.isiOS ? "AppStore" : "包地址",
      required: true
    }),
    N: _ctx.isWGT
  }, _ctx.isWGT ? {
    O: common_vendor.o(($event) => _ctx.binddata("is_silently", $event.detail.value), "06"),
    P: _ctx.formData.is_silently,
    Q: common_vendor.p({
      top: -80,
      content: _ctx.silentlyContent
    }),
    R: common_vendor.p({
      name: "is_silently",
      label: "静默更新"
    })
  } : {}, {
    S: !_ctx.isiOS
  }, !_ctx.isiOS ? {
    T: common_vendor.o(($event) => _ctx.binddata("is_mandatory", $event.detail.value), "2c"),
    U: _ctx.formData.is_mandatory,
    V: common_vendor.p({
      content: _ctx.mandatoryContent
    }),
    W: common_vendor.p({
      name: "is_mandatory",
      label: "强制更新"
    })
  } : {}, {
    X: common_vendor.o(($event) => _ctx.binddata("stable_publish", $event.detail.value), "5b"),
    Y: _ctx.formData.stable_publish,
    Z: common_vendor.p({
      top: -40,
      content: _ctx.stablePublishContent2
    }),
    aa: common_vendor.p({
      name: "stable_publish",
      label: "上线发行"
    }),
    ab: common_vendor.o(($event) => _ctx.formData.type = $event, "02"),
    ac: common_vendor.p({
      localdata: _ctx.formOptions.type_localdata,
      modelValue: _ctx.formData.type
    }),
    ad: common_vendor.p({
      name: "type",
      label: "安装包类型"
    }),
    ae: common_vendor.o((...args) => $options.submit && $options.submit(...args), "b9"),
    af: common_vendor.o((...args) => $options.back && $options.back(...args), "07"),
    ag: common_vendor.sr("form", "1c64b2e5-0"),
    ah: common_vendor.p({
      value: _ctx.formData,
      validateTrigger: "bind",
      labelWidth: _ctx.labelWidth
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-upgrade-center/pages/version/add.js.map
