"use strict";
const common_vendor = require("../../common/vendor.js");
const DEFAULT_MODEL = "gemini-3.1-flash-image-preview";
const DEFAULT_PROMPT = "将材质自然应用到窗帘区域，保持原场景结构、褶皱走向与真实光影，输出真实可用的窗帘预览图";
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
const _sfc_main = {
  data() {
    return {
      hasLogin: false,
      currentUid: "",
      generating: false,
      historyLoading: false,
      uploadingField: "",
      resultUrl: "",
      historyList: [],
      form: createDefaultForm()
    };
  },
  computed: {
    canGenerate() {
      return this.hasLogin && !this.generating && !this.uploadingField && !!this.form.backgroundFileId && !!this.form.backgroundSourceId && !!this.form.textureFileId && !!this.form.textureSourceId && !!this.normalizeString(this.form.prompt);
    },
    promptLength() {
      return this.normalizeString(this.form.prompt).length;
    }
  },
  onLoad() {
    this.syncLoginState();
    if (this.hasLogin) {
      this.loadHistory({
        silent: true
      });
    }
  },
  onShow() {
    const hadLogin = this.hasLogin;
    this.syncLoginState();
    if (this.hasLogin && (!hadLogin || this.historyList.length === 0)) {
      this.loadHistory({
        silent: true
      });
    }
    if (!this.hasLogin) {
      this.historyList = [];
    }
  },
  methods: {
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
      const redirectUrl = encodeURIComponent("/pages/cloudFunction/cloudFunction");
      common_vendor.index.navigateTo({
        url: `/uni_modules/uni-id-pages/pages/login/login-withoutpwd?uniIdRedirectUrl=${redirectUrl}`
      });
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
      common_vendor.index.__f__("log", "at pages/cloudFunction/cloudFunction.vue:274", "uploadImage", field, filePath);
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
        this.form.backgroundFileId = "";
        this.form.backgroundSourceId = "";
        this.form.textureFileId = "";
        this.form.textureSourceId = "";
        await this.loadHistory({
          silent: true
        });
        common_vendor.index.showToast({
          title: "生成成功",
          icon: "none"
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
    a: common_vendor.t($data.hasLogin ? "已登录，可生成并查看私有历史" : "未登录，生成前请先登录"),
    b: common_vendor.n($data.hasLogin ? "status-chip--online" : "status-chip--offline"),
    c: !$data.hasLogin
  }, !$data.hasLogin ? {
    d: common_vendor.o((...args) => $options.goLogin && $options.goLogin(...args), "73")
  } : {}, {
    e: $data.form.backgroundUrl
  }, $data.form.backgroundUrl ? {
    f: $data.form.backgroundUrl
  } : {}, {
    g: common_vendor.o(($event) => $options.chooseImage("background"), "c0"),
    h: common_vendor.o(($event) => $options.chooseImage("background"), "99"),
    i: $data.form.backgroundUrl
  }, $data.form.backgroundUrl ? {
    j: common_vendor.o(($event) => $options.clearImage("background"), "cf")
  } : {}, {
    k: $data.form.textureUrl
  }, $data.form.textureUrl ? {
    l: $data.form.textureUrl
  } : {}, {
    m: common_vendor.o(($event) => $options.chooseImage("texture"), "19"),
    n: common_vendor.o(($event) => $options.chooseImage("texture"), "31"),
    o: $data.form.textureUrl
  }, $data.form.textureUrl ? {
    p: common_vendor.o(($event) => $options.clearImage("texture"), "3e")
  } : {}, {
    q: common_vendor.t($options.promptLength),
    r: $data.form.prompt,
    s: common_vendor.o(($event) => $data.form.prompt = $event.detail.value, "40"),
    t: common_vendor.t($data.generating ? "生成中..." : "开始生成"),
    v: $data.generating,
    w: !$options.canGenerate,
    x: common_vendor.o((...args) => $options.submitGenerate && $options.submitGenerate(...args), "4b"),
    y: $data.generating || !!$data.uploadingField,
    z: common_vendor.o((...args) => $options.resetForm && $options.resetForm(...args), "cb"),
    A: $data.resultUrl
  }, $data.resultUrl ? {
    B: $data.resultUrl,
    C: common_vendor.o(($event) => $options.previewSingle($data.resultUrl), "ba")
  } : {}, {
    D: common_vendor.o((...args) => $options.refreshHistory && $options.refreshHistory(...args), "43"),
    E: !$data.hasLogin
  }, !$data.hasLogin ? {} : $data.historyLoading ? {} : $data.historyList.length === 0 ? {} : {
    H: common_vendor.f($data.historyList, (item, k0, i0) => {
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
    F: $data.historyLoading,
    G: $data.historyList.length === 0
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/cloudFunction/cloudFunction.js.map
