"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      privateFileID: ""
    };
  },
  mounted() {
  },
  methods: {
    chooseImage(isPrivate) {
      new Promise((resolve, reject) => {
        common_vendor.index.chooseImage({
          count: 1,
          success: (res) => {
            const path = res.tempFilePaths[0];
            common_vendor.index.getImageInfo({
              src: path,
              success(info) {
                const options = {
                  filePath: path,
                  cloudPath: Date.now() + "." + info.type.toLowerCase()
                };
                resolve(options);
              },
              fail(err) {
                reject(new Error(err.errMsg || "未能获取图片类型"));
              }
            });
          },
          fail: () => {
            reject(new Error("Fail_Cancel"));
          }
        });
      }).then((options) => {
        this.uploadFile(options);
      }).catch((err) => {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("log", "at pages/storage/ext-storage-qiniu.vue:69", err);
        if (err.message !== "Fail_Cancel") {
          common_vendor.index.showModal({
            content: `图片上传失败，错误信息为：${err.message}`,
            showCancel: false
          });
        }
      });
    },
    async uploadFile(options) {
      common_vendor.index.showLoading({
        title: "文件上传中..."
      });
      const uniCloudStorageExtCo = common_vendor._r.importObject("ext-storage-co", {
        customUI: true
      });
      const uploadFileOptionsRes = await uniCloudStorageExtCo.getUploadFileOptions({
        cloudPath: `test/${Date.now()}.jpg`
        // 支持自定义目录
      });
      common_vendor.index.__f__("log", "at pages/storage/ext-storage-qiniu.vue:88", "uploadFileOptionsRes: ", uploadFileOptionsRes);
      const uploadTask = common_vendor.index.uploadFile({
        ...uploadFileOptionsRes.uploadFileOptions,
        // 上传文件所需参数
        filePath: options.filePath,
        // 本地文件路径
        success: async () => {
          const res = {
            cloudPath: uploadFileOptionsRes.cloudPath,
            // 文件云端路径
            fileID: uploadFileOptionsRes.fileID,
            // 文件ID
            fileURL: uploadFileOptionsRes.fileURL
            // 文件URL（如果是私有权限，则此URL是无法直接访问的）
          };
          common_vendor.index.__f__("log", "at pages/storage/ext-storage-qiniu.vue:99", res);
          if (options.isPrivate) {
            const uniCloudStorageExtCo2 = common_vendor._r.importObject("ext-storage-co", {
              customUI: true
            });
            await uniCloudStorageExtCo2.setFilePrivate({
              fileID: res.fileID
            });
            this.privateFileID = res.fileID;
          }
          common_vendor.index.showModal({
            content: "图片上传成功，fileID为：" + res.fileID,
            showCancel: false
          });
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/storage/ext-storage-qiniu.vue:117", err);
          if (err.message !== "Fail_Cancel") {
            common_vendor.index.showModal({
              content: `图片上传失败，错误信息为：${err.message}`,
              showCancel: false
            });
          }
        },
        complete: () => {
          common_vendor.index.hideLoading();
        }
      });
      uploadTask.onProgressUpdate((res) => {
        common_vendor.index.__f__("log", "at pages/storage/ext-storage-qiniu.vue:131", "监听上传进度", res);
      });
    },
    async getTempFileURL() {
      const uniCloudStorageExtCo = common_vendor._r.importObject("ext-storage-co");
      let res = await uniCloudStorageExtCo.getTempFileURL({
        fileList: [this.privateFileID]
      });
      let tempFileURL = res.fileList[0].tempFileURL;
      common_vendor.index.showModal({
        content: "图片临时下载链接为：" + tempFileURL,
        showCancel: false
      });
    }
  }
};
if (!Array) {
  const _easycom_j_link2 = common_vendor.resolveComponent("j-link");
  _easycom_j_link2();
}
const _easycom_j_link = () => "../../components/j-link/j-link.js";
if (!Math) {
  _easycom_j_link();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      text: "参考",
      url: "https://uniapp.dcloud.net.cn/uniCloud/publish.html#useinmp"
    }),
    b: common_vendor.o(($event) => $options.chooseImage(false), "66"),
    c: common_vendor.o(($event) => $options.chooseImage(true), "f4"),
    d: $data.privateFileID
  }, $data.privateFileID ? {
    e: common_vendor.o(($event) => $options.getTempFileURL(), "4f")
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/storage/ext-storage-qiniu.js.map
