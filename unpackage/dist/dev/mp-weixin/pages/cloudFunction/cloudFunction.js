"use strict";
const common_vendor = require("../../common/vendor.js");
const common_curtainApp_frontend_renderSession = require("../../common/curtain-app/frontend/render-session.js");
const common_curtainApp_frontend_pageModels = require("../../common/curtain-app/frontend/page-models.js");
const common_curtainApp_frontend_pointSummary = require("../../common/curtain-app/frontend/point-summary.js");
const {
  readSceneSelection,
  clearSceneSelection,
  buildRenderDraft,
  saveRenderResult
} = common_curtainApp_frontend_renderSession.renderSession;
const { buildRenderHomeViewModel } = common_curtainApp_frontend_pageModels.pageModels;
const {
  createEmptyPointSummary,
  normalizePointSummary
} = common_curtainApp_frontend_pointSummary.pointSummaryModels;
const DEFAULT_MODEL = "gemini-3.1-flash-image-preview";
const DEFAULT_PROMPT = "将材质自然应用到窗帘区域，保持原场景结构、褶皱走向与真实光影，输出真实可用的窗帘预览图";
const PLEAT_OPTIONS = [
  { value: "1.8", label: "1.8倍" },
  { value: "2.0", label: "2.0倍" },
  { value: "2.2", label: "2.2倍" }
];
const HEAD_STYLE_OPTIONS = [
  { value: "simple", label: "简约韩式" },
  { value: "wave", label: "波浪帘头" },
  { value: "box", label: "盒型帘头" }
];
function createDefaultForm() {
  return {
    backgroundFileId: "",
    backgroundSourceId: "",
    backgroundUrl: "",
    textureFileId: "",
    textureSourceId: "",
    textureUrl: "",
    prompt: DEFAULT_PROMPT,
    model: DEFAULT_MODEL
  };
}
function createDefaultStyleForm() {
  return {
    pleatMultiple: "2.0",
    headStyle: "simple",
    includeSheer: true
  };
}
const _sfc_main = {
  created() {
    this.syncLoginState();
    this.pointSummaryLoading = this.hasLogin;
  },
  data() {
    return {
      hasLogin: false,
      currentUid: "",
      generating: false,
      historyLoading: false,
      uploadingField: "",
      resultUrl: "",
      historyList: [],
      pointSummary: createEmptyPointSummary(),
      pointSummaryLoading: false,
      pointSummaryError: "",
      form: createDefaultForm(),
      styleForm: createDefaultStyleForm(),
      pleatOptions: PLEAT_OPTIONS,
      headStyleOptions: HEAD_STYLE_OPTIONS
    };
  },
  computed: {
    canGenerate() {
      return this.hasLogin && !this.generating && !this.uploadingField && !!this.form.backgroundFileId && !!this.form.backgroundSourceId && !!this.form.textureFileId && !!this.form.textureSourceId && !!this.normalizeString(this.form.prompt);
    },
    promptLength() {
      return this.normalizeString(this.form.prompt).length;
    },
    homeView() {
      return buildRenderHomeViewModel({
        hasLogin: this.hasLogin,
        balance: this.pointSummary.balance,
        generating: this.generating,
        canGenerate: this.canGenerate,
        pointSummaryLoading: this.pointSummaryLoading,
        pointSummaryError: this.pointSummaryError
      });
    },
    selectedPleatIndex() {
      const index = this.pleatOptions.findIndex((item) => item.value === this.styleForm.pleatMultiple);
      return index < 0 ? 1 : index;
    },
    selectedHeadStyleIndex() {
      const index = this.headStyleOptions.findIndex((item) => item.value === this.styleForm.headStyle);
      return index < 0 ? 0 : index;
    },
    currentPleatLabel() {
      return (this.pleatOptions[this.selectedPleatIndex] || {}).label || "2.0倍";
    },
    currentHeadStyleLabel() {
      return (this.headStyleOptions[this.selectedHeadStyleIndex] || {}).label || "简约韩式";
    }
  },
  onLoad() {
    this.handlePageLoad();
  },
  onShow() {
    this.handlePageShow();
  },
  methods: {
    handlePageLoad() {
      this.syncLoginState();
      if (this.hasLogin) {
        this.loadHistory({
          silent: true
        });
      }
    },
    handlePageShow() {
      const hadLogin = this.hasLogin;
      this.syncLoginState();
      this.applySceneSelection();
      if (this.hasLogin && (!hadLogin || this.historyList.length === 0)) {
        this.loadHistory({
          silent: true
        });
      }
      if (this.hasLogin) {
        this.loadPointSummary();
      }
      if (!this.hasLogin) {
        this.historyList = [];
        this.pointSummary = createEmptyPointSummary();
        this.pointSummaryLoading = false;
        this.pointSummaryError = "";
      }
    },
    normalizeString(value) {
      return typeof value === "string" ? value.trim() : "";
    },
    syncLoginState() {
      const currentUser = typeof common_vendor._r.getCurrentUserInfo === "function" ? common_vendor._r.getCurrentUserInfo() : {};
      const tokenExpired = Number(currentUser && currentUser.tokenExpired || 0);
      const uid = this.normalizeString(currentUser && currentUser.uid);
      if (this.currentUid && this.currentUid !== uid) {
        this.form.backgroundFileId = "";
        this.form.backgroundSourceId = "";
        this.form.textureFileId = "";
        this.form.textureSourceId = "";
        this.resultUrl = "";
      }
      this.hasLogin = !!uid && tokenExpired > Date.now();
      this.currentUid = this.hasLogin ? uid : "";
    },
    ensureLogin(actionText) {
      this.syncLoginState();
      if (this.hasLogin) {
        return true;
      }
      common_vendor.index.showModal({
        content: `${actionText}前请先登录`,
        confirmText: "去登录",
        success: (res) => {
          if (res.confirm) {
            this.goLogin();
          }
        }
      });
      return false;
    },
    goLogin() {
      const redirectUrl = encodeURIComponent("/pages/render/index");
      common_vendor.index.navigateTo({
        url: `/uni_modules/uni-id-pages/pages/login/login-withoutpwd?uniIdRedirectUrl=${redirectUrl}`
      });
    },
    openProfile() {
      if (!this.hasLogin) {
        this.goLogin();
        return;
      }
      common_vendor.index.navigateTo({
        url: "/uni_modules/uni-id-pages/pages/userinfo/userinfo"
      });
    },
    goRecharge() {
      if (!this.hasLogin) {
        this.goLogin();
        return;
      }
      common_vendor.index.navigateTo({
        url: "/pages/profile/recharge"
      });
    },
    handlePleatChange(event) {
      const index = Number(event && event.detail && event.detail.value || 0);
      const target = this.pleatOptions[index];
      if (target) {
        this.styleForm.pleatMultiple = target.value;
      }
    },
    handleHeadStyleChange(event) {
      const index = Number(event && event.detail && event.detail.value || 0);
      const target = this.headStyleOptions[index];
      if (target) {
        this.styleForm.headStyle = target.value;
      }
    },
    toggleIncludeSheer() {
      this.styleForm.includeSheer = !this.styleForm.includeSheer;
    },
    applySceneSelection() {
      return this.prepareSceneSelection();
    },
    async prepareSceneSelection() {
      const scene = readSceneSelection();
      const draft = buildRenderDraft(scene);
      const hasDraft = !!(draft.sceneTemplateId || draft.backgroundImage || draft.textureImage || draft.prompt);
      if (!hasDraft) {
        return;
      }
      this.form.backgroundFileId = "";
      this.form.backgroundSourceId = "";
      this.form.backgroundUrl = draft.backgroundImage;
      this.form.textureUrl = draft.textureImage || "";
      this.form.prompt = draft.prompt || DEFAULT_PROMPT;
      this.form.model = draft.model || DEFAULT_MODEL;
      this.form.textureFileId = "";
      this.form.textureSourceId = "";
      this.styleForm = {
        pleatMultiple: draft.config && draft.config.pleatMultiple || "2.0",
        headStyle: draft.config && draft.config.headStyle || "simple",
        includeSheer: typeof (draft.config && draft.config.includeSheer) === "boolean" ? draft.config.includeSheer : true
      };
      this.resultUrl = "";
      if (!draft.backgroundFileId) {
        clearSceneSelection();
        common_vendor.index.showToast({
          title: draft.textureImage || draft.prompt ? "作品信息已回填，如需生成请重新上传原图" : "样板间已回填，如需生成请补传背景图原图",
          icon: "none",
          duration: 2600
        });
        return;
      }
      if (!this.hasLogin) {
        common_vendor.index.showToast({
          title: "样板间已回填，登录后可直接生成",
          icon: "none",
          duration: 2600
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "同步样板间..."
      });
      try {
        const res = await common_vendor._r.callFunction({
          name: "curtain-scene-create-source-ticket",
          data: {
            sceneTemplateId: draft.sceneTemplateId
          }
        });
        const result = res.result || {};
        if (!result.success || !result.sourceId || !result.backgroundFileId) {
          throw new Error(result.message || "样板间背景图准备失败");
        }
        this.form.backgroundFileId = this.normalizeString(result.backgroundFileId);
        this.form.backgroundSourceId = this.normalizeString(result.sourceId);
        if (this.normalizeString(result.backgroundUrl)) {
          this.form.backgroundUrl = this.normalizeString(result.backgroundUrl);
        }
        clearSceneSelection();
        common_vendor.index.showToast({
          title: "样板间已回填，可继续上传材质图",
          icon: "none",
          duration: 2200
        });
      } catch (error) {
        this.form.backgroundFileId = "";
        this.form.backgroundSourceId = "";
        common_vendor.index.showToast({
          title: this.normalizeString(error.message) || "样板间已回填，请补传背景原图",
          icon: "none",
          duration: 2800
        });
        clearSceneSelection();
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    async loadPointSummary() {
      this.pointSummaryLoading = true;
      this.pointSummaryError = "";
      try {
        const res = await common_vendor._r.callFunction({
          name: "curtain-point-summary",
          data: {}
        });
        const result = res.result || {};
        if (!result.success) {
          throw new Error(result.message || "点数账户加载失败");
        }
        this.pointSummary = normalizePointSummary(result);
        this.pointSummaryError = "";
      } catch (error) {
        const errorMessage = this.normalizeString(error && error.message) || "点数账户加载失败";
        this.pointSummary = createEmptyPointSummary();
        this.pointSummaryError = errorMessage;
        common_vendor.index.showToast({
          title: errorMessage,
          icon: "none",
          duration: 2500
        });
      } finally {
        this.pointSummaryLoading = false;
      }
    },
    getFieldConfig(field) {
      return field === "background" ? {
        label: "背景图",
        fileIdKey: "backgroundFileId",
        sourceIdKey: "backgroundSourceId",
        urlKey: "backgroundUrl"
      } : {
        label: "材质图",
        fileIdKey: "textureFileId",
        sourceIdKey: "textureSourceId",
        urlKey: "textureUrl"
      };
    },
    getFileExtension(filePath) {
      const cleanPath = this.normalizeString(filePath).split("?")[0];
      const match = cleanPath.match(/\.([a-zA-Z0-9]+)$/);
      return match ? match[1].toLowerCase() : "png";
    },
    clearImage(field) {
      const config = this.getFieldConfig(field);
      this.form[config.fileIdKey] = "";
      this.form[config.sourceIdKey] = "";
      this.form[config.urlKey] = "";
    },
    resetForm() {
      this.form = createDefaultForm();
      this.styleForm = createDefaultStyleForm();
      this.resultUrl = "";
    },
    chooseImage(field) {
      if (this.uploadingField || this.generating) {
        return;
      }
      if (!this.ensureLogin("上传图片")) {
        return;
      }
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        success: (res) => {
          const filePath = (res.tempFilePaths || [])[0] || "";
          if (!filePath) {
            return;
          }
          this.uploadImage(field, filePath);
        }
      });
    },
    async uploadImage(field, filePath) {
      const config = this.getFieldConfig(field);
      const ext = this.getFileExtension(filePath);
      this.uploadingField = field;
      common_vendor.index.showLoading({
        title: "上传中..."
      });
      try {
        const ticketRes = await common_vendor._r.callFunction({
          name: "curtain-preview-create-upload-ticket",
          data: {
            kind: field,
            ext
          }
        });
        const ticket = ticketRes.result || {};
        if (!ticket.success || !ticket.cloudPath || !ticket.sourceId) {
          throw new Error(ticket.message || `${config.label}上传凭证创建失败`);
        }
        const uploadRes = await common_vendor._r.uploadFile({
          filePath,
          cloudPath: ticket.cloudPath
        });
        const fileId = this.normalizeString(uploadRes.fileID || uploadRes.fileId);
        if (!fileId) {
          throw new Error(`${config.label}上传成功但未返回 fileID`);
        }
        this.form[config.fileIdKey] = fileId;
        this.form[config.sourceIdKey] = ticket.sourceId;
        this.form[config.urlKey] = filePath;
        common_vendor.index.showToast({
          title: `${config.label}上传成功`,
          icon: "none"
        });
      } catch (error) {
        this.clearImage(field);
        common_vendor.index.showModal({
          content: error.message || `${config.label}上传失败`,
          showCancel: false
        });
      } finally {
        common_vendor.index.hideLoading();
        this.uploadingField = "";
      }
    },
    async submitGenerate() {
      if (!this.ensureLogin("生成预览")) {
        return;
      }
      if (!this.canGenerate) {
        common_vendor.index.showModal({
          content: "请先上传背景图、材质图并填写提示词",
          showCancel: false
        });
        return;
      }
      this.generating = true;
      common_vendor.index.showLoading({
        title: "生成中..."
      });
      try {
        const detailPayload = {
          backgroundUrl: this.normalizeString(this.form.backgroundUrl),
          textureUrl: this.normalizeString(this.form.textureUrl),
          prompt: this.normalizeString(this.form.prompt),
          model: this.form.model,
          status: "success"
        };
        const res = await common_vendor._r.callFunction({
          name: "curtain-preview-generate",
          data: {
            backgroundFileId: this.form.backgroundFileId,
            backgroundSourceId: this.form.backgroundSourceId,
            textureFileId: this.form.textureFileId,
            textureSourceId: this.form.textureSourceId,
            prompt: this.normalizeString(this.form.prompt),
            model: this.form.model
          }
        });
        const result = res.result || {};
        if (!result.success) {
          throw new Error(result.message || "生成失败");
        }
        this.resultUrl = this.normalizeString(result.resultUrl);
        saveRenderResult({
          ...detailPayload,
          recordId: this.normalizeString(result.recordId),
          resultUrl: this.normalizeString(result.resultUrl),
          coverUrl: this.normalizeString(result.resultUrl),
          errorMessage: ""
        });
        this.form.backgroundFileId = "";
        this.form.backgroundSourceId = "";
        this.form.textureFileId = "";
        this.form.textureSourceId = "";
        await this.loadPointSummary();
        await this.loadHistory({
          silent: true
        });
        common_vendor.index.navigateTo({
          url: "/pages/render/result"
        });
      } catch (error) {
        const errorMessage = this.normalizeString(error.message);
        if (/已被使用|已过期/.test(errorMessage)) {
          this.form.backgroundFileId = "";
          this.form.backgroundSourceId = "";
          this.form.textureFileId = "";
          this.form.textureSourceId = "";
        }
        common_vendor.index.showModal({
          content: errorMessage || "生成失败",
          showCancel: false
        });
      } finally {
        common_vendor.index.hideLoading();
        this.generating = false;
      }
    },
    async loadHistory({
      silent = false
    } = {}) {
      this.syncLoginState();
      if (!this.hasLogin) {
        this.historyList = [];
        return;
      }
      this.historyLoading = true;
      try {
        const res = await common_vendor._r.callFunction({
          name: "curtain-preview-history",
          data: {
            pageNo: 1,
            pageSize: 10
          }
        });
        const result = res.result || {};
        if (!result.success) {
          throw new Error(result.message || "历史记录加载失败");
        }
        this.historyList = Array.isArray(result.list) ? result.list.map((item) => ({
          ...item,
          backgroundUrl: this.normalizeString(item.backgroundUrl),
          textureUrl: this.normalizeString(item.textureUrl),
          resultUrl: this.normalizeString(item.resultUrl)
        })) : [];
      } catch (error) {
        this.historyList = [];
        if (!silent) {
          common_vendor.index.showToast({
            title: error.message || "历史记录加载失败",
            icon: "none"
          });
        }
      } finally {
        this.historyLoading = false;
      }
    },
    refreshHistory() {
      if (!this.hasLogin) {
        this.ensureLogin("查看历史记录");
        return;
      }
      this.loadHistory();
    },
    applyHistory(item) {
      this.form.prompt = this.normalizeString(item && item.prompt) || DEFAULT_PROMPT;
      this.form.model = this.normalizeString(item && item.model) || DEFAULT_MODEL;
      this.form.backgroundUrl = this.normalizeString(item && item.backgroundUrl);
      this.form.textureUrl = this.normalizeString(item && item.textureUrl);
      this.form.backgroundFileId = "";
      this.form.backgroundSourceId = "";
      this.form.textureFileId = "";
      this.form.textureSourceId = "";
      this.resultUrl = this.normalizeString(item && item.resultUrl);
      common_vendor.index.showToast({
        title: "已回显历史记录，如需重新生成请重新上传原图",
        icon: "none",
        duration: 2600
      });
    },
    previewSingle(url) {
      const targetUrl = this.normalizeString(url);
      if (!targetUrl) {
        return;
      }
      common_vendor.index.previewImage({
        urls: [targetUrl],
        current: targetUrl
      });
    },
    formatStatus(status) {
      if (status === "success") {
        return "成功";
      }
      if (status === "fail") {
        return "失败";
      }
      return "处理中";
    },
    statusClass(status) {
      if (status === "success") {
        return "history-status--success";
      }
      if (status === "fail") {
        return "history-status--fail";
      }
      return "history-status--processing";
    },
    formatTime(value) {
      if (!value) {
        return "";
      }
      let date = null;
      if (value instanceof Date) {
        date = value;
      } else if (typeof value === "number" || typeof value === "string") {
        const rawDate = new Date(value);
        if (!Number.isNaN(rawDate.getTime())) {
          date = rawDate;
        }
      } else if (typeof value === "object") {
        if (typeof value.getTime === "function") {
          const time = value.getTime();
          if (!Number.isNaN(time)) {
            date = new Date(time);
          }
        } else if (value.$date) {
          const rawDate = new Date(value.$date);
          if (!Number.isNaN(rawDate.getTime())) {
            date = rawDate;
          }
        } else if (typeof value._seconds === "number") {
          date = new Date(value._seconds * 1e3);
        } else if (typeof value.seconds === "number") {
          date = new Date(value.seconds * 1e3);
        }
      }
      if (!date || Number.isNaN(date.getTime())) {
        return "";
      }
      const year = date.getFullYear();
      const month = `${date.getMonth() + 1}`.padStart(2, "0");
      const day = `${date.getDate()}`.padStart(2, "0");
      const hour = `${date.getHours()}`.padStart(2, "0");
      const minute = `${date.getMinutes()}`.padStart(2, "0");
      return `${year}-${month}-${day} ${hour}:${minute}`;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($options.homeView.brandText),
    b: common_vendor.t($data.hasLogin ? "我" : "登"),
    c: common_vendor.o((...args) => $options.openProfile && $options.openProfile(...args), "dd"),
    d: common_vendor.t($options.homeView.greetingText),
    e: common_vendor.t($options.homeView.pointsText),
    f: common_vendor.t($options.homeView.loginHintText),
    g: $data.form.backgroundUrl
  }, $data.form.backgroundUrl ? {
    h: $data.form.backgroundUrl
  } : {}, {
    i: common_vendor.t($data.form.backgroundUrl ? "重新上传" : "选择图片"),
    j: common_vendor.o(($event) => $options.chooseImage("background"), "b8"),
    k: $data.form.backgroundUrl
  }, $data.form.backgroundUrl ? {
    l: common_vendor.o(($event) => $options.clearImage("background"), "bd")
  } : {}, {
    m: common_vendor.o(($event) => $options.chooseImage("background"), "8f"),
    n: $data.form.textureUrl
  }, $data.form.textureUrl ? {
    o: $data.form.textureUrl
  } : {}, {
    p: common_vendor.t($data.form.textureUrl ? "重新上传" : "选择图片"),
    q: common_vendor.o(($event) => $options.chooseImage("texture"), "7d"),
    r: $data.form.textureUrl
  }, $data.form.textureUrl ? {
    s: common_vendor.o(($event) => $options.clearImage("texture"), "de")
  } : {}, {
    t: common_vendor.o(($event) => $options.chooseImage("texture"), "47"),
    v: common_vendor.t($options.currentPleatLabel),
    w: $data.pleatOptions,
    x: $options.selectedPleatIndex,
    y: common_vendor.o((...args) => $options.handlePleatChange && $options.handlePleatChange(...args), "d9"),
    z: common_vendor.t($options.currentHeadStyleLabel),
    A: $data.headStyleOptions,
    B: $options.selectedHeadStyleIndex,
    C: common_vendor.o((...args) => $options.handleHeadStyleChange && $options.handleHeadStyleChange(...args), "1d"),
    D: $data.styleForm.includeSheer
  }, $data.styleForm.includeSheer ? {} : {}, {
    E: common_vendor.n($data.styleForm.includeSheer ? "checkbox-box--checked" : ""),
    F: common_vendor.o((...args) => $options.toggleIncludeSheer && $options.toggleIncludeSheer(...args), "6e"),
    G: common_vendor.t($options.promptLength),
    H: $data.form.prompt,
    I: common_vendor.o(($event) => $data.form.prompt = $event.detail.value, "b9"),
    J: common_vendor.t($options.homeView.submitText),
    K: $data.generating,
    L: $options.homeView.submitDisabled,
    M: common_vendor.o((...args) => $options.submitGenerate && $options.submitGenerate(...args), "ba"),
    N: common_vendor.o((...args) => $options.goRecharge && $options.goRecharge(...args), "1c"),
    O: $data.resultUrl
  }, $data.resultUrl ? {
    P: common_vendor.o(($event) => $options.previewSingle($data.resultUrl), "fb"),
    Q: $data.resultUrl,
    R: common_vendor.o(($event) => $options.previewSingle($data.resultUrl), "8a")
  } : {}, {
    S: common_vendor.o((...args) => $options.refreshHistory && $options.refreshHistory(...args), "1a"),
    T: !$data.hasLogin
  }, !$data.hasLogin ? {} : $data.historyLoading ? {} : $data.historyList.length === 0 ? {} : {
    W: common_vendor.f($data.historyList, (item, k0, i0) => {
      return {
        a: item.resultUrl || item.backgroundUrl || item.textureUrl,
        b: common_vendor.t($options.formatStatus(item.status)),
        c: common_vendor.n($options.statusClass(item.status)),
        d: common_vendor.t($options.formatTime(item.createTime)),
        e: common_vendor.t(item.prompt || "未填写提示词"),
        f: common_vendor.o(($event) => $options.previewSingle(item.resultUrl || item.backgroundUrl || item.textureUrl), item._id),
        g: common_vendor.o(($event) => $options.applyHistory(item), item._id),
        h: item._id,
        i: common_vendor.o(($event) => $options.applyHistory(item), item._id)
      };
    })
  }, {
    U: $data.historyLoading,
    V: $data.historyList.length === 0
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/cloudFunction/cloudFunction.js.map
