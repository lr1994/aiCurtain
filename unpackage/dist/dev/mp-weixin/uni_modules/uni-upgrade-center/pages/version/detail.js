"use strict";
const common_vendor = require("../../../../common/vendor.js");
const uni_modules_uniUpgradeCenter_pages_mixin_version_add_detail_mixin = require("../mixin/version_add_detail_mixin.js");
const uni_modules_uniUpgradeCenter_pages_utils = require("../utils.js");
const showInfo = () => "../components/show-info.js";
const db = common_vendor._r.database();
db.command;
const dbCollectionName = uni_modules_uniUpgradeCenter_pages_utils.appVersionListDbName;
const _sfc_main = {
  components: {
    showInfo
  },
  mixins: [uni_modules_uniUpgradeCenter_pages_mixin_version_add_detail_mixin.addAndDetail],
  data() {
    return {
      showStableInfo: false,
      isStable: true,
      // 是否是线上发行版
      originalData: {},
      // 原始数据，用于恢复状态
      detailsState: true
      // 查看状态
    };
  },
  async onLoad(e) {
    const id = e.id;
    this.formDataId = id;
    await this.getDetail(id);
    this.isStable = this.formData.stable_publish;
    this.latestStableData = await this.getLatestVersion();
    if (this.isWGT) {
      this.rules.min_uni_version.rules.push({
        "required": true
      });
    }
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
        res.store_list = this.formData.store_list;
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
      const collectionDB = db.collection(dbCollectionName);
      collectionDB.doc(this.formDataId).update(value).then(async (res) => {
        if (!this.isStable && value.stable_publish === true && this.latestStableData) {
          await collectionDB.doc(this.latestStableData._id).update({
            stable_publish: false
          });
        }
        common_vendor.index.showToast({
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
      return db.collection(dbCollectionName).doc(id).field(uni_modules_uniUpgradeCenter_pages_mixin_version_add_detail_mixin.fields).get().then((res) => {
        const data = res.result.data[0];
        if (data) {
          this.formData = data;
          this.originalData = uni_modules_uniUpgradeCenter_pages_utils.deepClone(this.formData);
        }
      }).catch((err) => {
        common_vendor.index.showModal({
          content: err.message || "请求服务失败",
          showCancel: false
        });
      }).finally(() => {
        common_vendor.index.hideLoading();
      });
    },
    deletePackage() {
      common_vendor.index.showModal({
        title: "提示",
        content: "是否删除该版本",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showLoading({
              mask: true
            });
            db.collection(dbCollectionName).doc(this.formDataId).remove().then(() => {
              common_vendor.index.showToast({
                title: "删除成功"
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
          }
        }
      });
    },
    async getLatestVersion() {
      const where = {
        appid: this.formData.appid,
        type: this.formData.type,
        stable_publish: true
      };
      if (!this.isWGT) {
        where.platform = this.formData.platform[0];
      }
      const latestStableData = await db.collection(dbCollectionName).where(where).get();
      return latestStableData.result.data.find((item) => item.platform.toString() === this.formData.platform.toString());
    },
    cancelEdit() {
      let content = "";
      !this.isiOS && this.hasPackage ? content += "\n将会删除已上传的包" : "";
      common_vendor.index.showModal({
        title: "取消修改",
        content,
        success: (res) => {
          if (res.confirm) {
            this.formData = uni_modules_uniUpgradeCenter_pages_utils.deepClone(this.originalData);
            this.detailsState = true;
            if (this.hasPackage) {
              let fileList = [];
              fileList.push(this.appFileList.url);
              this.$request("deleteFile", {
                fileList
              }, {
                functionName: "upgrade-center"
              });
            }
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
  const _easycom_uni_dateformat2 = common_vendor.resolveComponent("uni-dateformat");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  (_easycom_uni_easyinput2 + _easycom_uni_forms_item2 + _easycom_uni_data_checkbox2 + _component_show_info + _easycom_uni_file_picker2 + _easycom_uni_dateformat2 + _easycom_uni_forms2)();
}
const _easycom_uni_easyinput = () => "../../../uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_uni_forms_item = () => "../../../uni-forms/components/uni-forms-item/uni-forms-item.js";
const _easycom_uni_data_checkbox = () => "../../../uni-data-checkbox/components/uni-data-checkbox/uni-data-checkbox.js";
const _easycom_uni_file_picker = () => "../../../uni-file-picker/components/uni-file-picker/uni-file-picker.js";
const _easycom_uni_dateformat = () => "../../../uni-dateformat/components/uni-dateformat/uni-dateformat.js";
const _easycom_uni_forms = () => "../../../uni-forms/components/uni-forms/uni-forms.js";
if (!Math) {
  (_easycom_uni_easyinput + _easycom_uni_forms_item + _easycom_uni_data_checkbox + _easycom_uni_file_picker + _easycom_uni_dateformat + _easycom_uni_forms)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t(_ctx.type_valuetotext[_ctx.formData.type]),
    b: !$data.isStable
  }, !$data.isStable ? {
    c: common_vendor.o((...args) => $options.deletePackage && $options.deletePackage(...args), "8b")
  } : {}, {
    d: common_vendor.o(($event) => _ctx.formData.appid = $event, "91"),
    e: common_vendor.p({
      disabled: true,
      trim: "both",
      modelValue: _ctx.formData.appid
    }),
    f: common_vendor.p({
      name: "appid",
      label: "AppID",
      required: true
    }),
    g: common_vendor.o(($event) => _ctx.formData.name = $event, "39"),
    h: common_vendor.p({
      disabled: true,
      trim: "both",
      modelValue: _ctx.formData.name
    }),
    i: common_vendor.p({
      name: "name",
      label: "应用名称"
    }),
    j: common_vendor.o(($event) => _ctx.formData.title = $event, "7a"),
    k: common_vendor.p({
      disabled: $data.detailsState,
      placeholder: "更新标题",
      modelValue: _ctx.formData.title
    }),
    l: common_vendor.p({
      name: "title",
      label: "更新标题"
    }),
    m: $data.detailsState,
    n: common_vendor.o(($event) => _ctx.binddata("contents", $event.detail.value), "03"),
    o: _ctx.formData.contents,
    p: common_vendor.o((val) => _ctx.formData.contents = val, "83"),
    q: common_vendor.p({
      name: "contents",
      label: "更新内容",
      required: true
    }),
    r: common_vendor.o(($event) => _ctx.formData.platform = $event, "0b"),
    s: common_vendor.p({
      disabled: true,
      multiple: true,
      localdata: _ctx.platformLocaldata,
      modelValue: _ctx.formData.platform
    }),
    t: common_vendor.p({
      name: "platform",
      label: "平台",
      required: true
    }),
    v: common_vendor.o(($event) => _ctx.formData.version = $event, "33"),
    w: common_vendor.p({
      disabled: true,
      placeholder: "当前包版本号，必须大于当前已上线版本号",
      modelValue: _ctx.formData.version
    }),
    x: common_vendor.p({
      name: "version",
      label: "版本号",
      required: true
    }),
    y: _ctx.isWGT
  }, _ctx.isWGT ? {
    z: common_vendor.o(($event) => _ctx.formData.min_uni_version = $event, "3e"),
    A: common_vendor.p({
      disabled: $data.detailsState,
      placeholder: "原生App最低版本",
      modelValue: _ctx.formData.min_uni_version
    }),
    B: common_vendor.p({
      content: _ctx.minUniVersionContent
    }),
    C: common_vendor.p({
      name: "min_uni_version",
      label: "原生App最低版本",
      required: _ctx.isWGT
    })
  } : {}, {
    D: !_ctx.isiOS && !$data.detailsState
  }, !_ctx.isiOS && !$data.detailsState ? common_vendor.e({
    E: common_vendor.o((...args) => _ctx.selectFile && _ctx.selectFile(...args), "99"),
    F: common_vendor.o(_ctx.packageUploadSuccess, "45"),
    G: common_vendor.o(_ctx.packageDelete, "6a"),
    H: common_vendor.o(($event) => _ctx.appFileList = $event, "51"),
    I: common_vendor.p({
      ["file-extname"]: _ctx.fileExtname,
      disabled: _ctx.hasPackage,
      returnType: "object",
      ["file-mediatype"]: "all",
      limit: "1",
      modelValue: _ctx.appFileList
    }),
    J: _ctx.hasPackage
  }, _ctx.hasPackage ? {
    K: common_vendor.t(Number(_ctx.appFileList.size / 1024 / 1024).toFixed(2))
  } : {}, {
    L: common_vendor.p({
      label: "上传apk包"
    })
  }) : {}, {
    M: common_vendor.o(($event) => _ctx.formData.url = $event, "79"),
    N: common_vendor.p({
      disabled: $data.detailsState,
      placeholder: "下载链接",
      maxlength: -1,
      modelValue: _ctx.formData.url
    }),
    O: common_vendor.p({
      name: "url",
      label: _ctx.isiOS ? "AppStore" : "下载链接",
      required: true
    }),
    P: _ctx.isWGT
  }, _ctx.isWGT ? {
    Q: $data.detailsState,
    R: common_vendor.o(($event) => (_ctx.binddata("is_silently", $event.detail.value), _ctx.formData.is_silently = $event.detail.value), "5e"),
    S: _ctx.formData.is_silently,
    T: common_vendor.p({
      top: -80,
      content: _ctx.silentlyContent
    }),
    U: common_vendor.p({
      name: "is_silently",
      label: "静默更新"
    })
  } : {}, {
    V: !_ctx.isiOS
  }, !_ctx.isiOS ? {
    W: $data.detailsState,
    X: common_vendor.o(($event) => (_ctx.binddata("is_mandatory", $event.detail.value), _ctx.formData.is_mandatory = $event.detail.value), "17"),
    Y: _ctx.formData.is_mandatory,
    Z: common_vendor.p({
      width: "230",
      top: -30,
      content: _ctx.mandatoryContent
    }),
    aa: common_vendor.p({
      name: "is_mandatory",
      label: "强制更新"
    })
  } : {}, {
    ab: $data.detailsState || $data.isStable,
    ac: common_vendor.o(($event) => (_ctx.binddata("stable_publish", $event.detail.value), _ctx.formData.stable_publish = $event.detail.value), "57"),
    ad: _ctx.formData.stable_publish,
    ae: $data.isStable
  }, $data.isStable ? {
    af: common_vendor.p({
      top: -50,
      width: "350",
      content: _ctx.stablePublishContent
    })
  } : {
    ag: common_vendor.p({
      top: -40,
      content: _ctx.stablePublishContent2
    })
  }, {
    ah: common_vendor.p({
      name: "stable_publish",
      label: "上线发行"
    }),
    ai: common_vendor.p({
      format: "yyyy-MM-dd hh:mm:ss",
      date: _ctx.formData.create_date,
      threshold: [0, 0]
    }),
    aj: common_vendor.p({
      name: "create_date",
      label: "上传时间"
    }),
    ak: common_vendor.o(($event) => _ctx.formData.type = $event, "8c"),
    al: common_vendor.p({
      localdata: _ctx.formOptions.type_localdata,
      modelValue: _ctx.formData.type
    }),
    am: common_vendor.p({
      name: "type",
      label: "安装包类型"
    }),
    an: $data.detailsState
  }, $data.detailsState ? {
    ao: common_vendor.o(($event) => $data.detailsState = false, "7e")
  } : {}, {
    ap: !$data.detailsState
  }, !$data.detailsState ? {
    aq: common_vendor.o((...args) => $options.submit && $options.submit(...args), "a3")
  } : {}, {
    ar: !$data.detailsState
  }, !$data.detailsState ? {
    as: common_vendor.o((...args) => $options.cancelEdit && $options.cancelEdit(...args), "dd")
  } : {}, {
    at: common_vendor.sr("form", "e68b0a86-0"),
    av: common_vendor.p({
      value: _ctx.formData,
      validateTrigger: "bind",
      labelWidth: _ctx.labelWidth
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-upgrade-center/pages/version/detail.js.map
