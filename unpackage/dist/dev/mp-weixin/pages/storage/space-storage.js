"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {};
  },
  mounted() {
  },
  methods: {
    chooseAndUploadFile(file) {
      common_vendor.index.showLoading({
        title: "文件上传中..."
      });
      common_vendor._r.chooseAndUploadFile({
        type: "image",
        onChooseFile: (res) => {
          common_vendor.index.__f__("log", "at pages/storage/space-storage.vue:33", res);
          const processAll = [];
          for (let i = 0; i < res.tempFiles.length; i++) {
            processAll.push(this.cropImg(res.tempFiles[i]));
          }
          return Promise.all(processAll).then((fileList) => {
            let result = {
              tempFilePaths: []
            };
            result.tempFiles = fileList.map((fileItem, index) => {
              result.tempFilePaths.push(fileItem.path);
              return {
                path: fileItem.path,
                cloudPath: "" + Date.now() + index + "." + fileItem.ext,
                // 云端路径，这里随便生成了一个
                fileType: fileItem.fileType
              };
            });
            return result;
          });
        }
      }).then((res) => {
        common_vendor.index.__f__("log", "at pages/storage/space-storage.vue:54", res);
        common_vendor.index.showModal({
          content: JSON.stringify(res),
          showCancel: false
        });
      }).catch((err) => {
        common_vendor.index.__f__("log", "at pages/storage/space-storage.vue:60", err);
        common_vendor.index.showModal({
          content: JSON.stringify(err),
          showCancel: false
        });
      }).finally(() => {
        common_vendor.index.hideLoading();
      });
    },
    cropImg(file) {
      return new Promise((resolve, reject) => {
        let ext;
        let filePathProcessed = file.path;
        common_vendor.index.getImageInfo({
          src: file.path,
          success(info) {
            ext = info.type.toLowerCase();
            resolve({
              path: filePathProcessed,
              ext,
              fileType: file.fileType
            });
          },
          fail(err) {
            reject(new Error(err.errMsg || "未能获取图片类型"));
          }
        });
      });
    },
    chooseImage() {
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
        common_vendor.index.__f__("log", "at pages/storage/space-storage.vue:138", err);
        if (err.message !== "Fail_Cancel") {
          common_vendor.index.showModal({
            content: `图片上传失败，错误信息为：${err.message}`,
            showCancel: false
          });
        }
      });
    },
    uploadFile(options) {
      common_vendor.index.showLoading({
        title: "文件上传中..."
      });
      common_vendor._r.uploadFile({
        ...options,
        onUploadProgress(e) {
          common_vendor.index.__f__("log", "at pages/storage/space-storage.vue:154", e);
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/storage/space-storage.vue:158", res);
          common_vendor.index.showModal({
            content: "图片上传成功，fileID为：" + res.fileID,
            showCancel: false
          });
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/storage/space-storage.vue:166", err);
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
  return {
    a: common_vendor.p({
      text: "参考",
      url: "https://uniapp.dcloud.net.cn/uniCloud/publish.html#useinmp"
    }),
    b: common_vendor.o((...args) => $options.chooseImage && $options.chooseImage(...args), "bf"),
    c: common_vendor.o(($event) => $options.chooseAndUploadFile(), "b0")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/storage/space-storage.js.map
