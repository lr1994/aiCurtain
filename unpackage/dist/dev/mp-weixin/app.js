"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/cloudFunction/cloudFunction.js";
  "./pages/cloudObject/cloudObject.js";
  "./pages/secure-network/cloud-function.js";
  "./pages/secure-network/cloud-object.js";
  "./pages/test/test.js";
  "./pages/clientDB/unicloud-db-demo/unicloud-db-demo.js";
  "./pages/clientDB/demo/demo.js";
  "./pages/clientDB/permission-table-simple/permission-table-simple.js";
  "./pages/clientDB/permission-table-compound/permission-table-compound.js";
  "./pages/clientDB/clientDB.js";
  "./pages/user-info/add.js";
  "./pages/user-info/edit.js";
  "./pages/user-info/list.js";
  "./pages/user-info/detail.js";
  "./pages/storage/storage.js";
  "./pages/storage/space-storage.js";
  "./pages/storage/ext-storage-qiniu.js";
  "./pages/schema2code/schema2code.js";
  "./pages/clientDB/permission/permission.js";
  "./pages/clientDB/permission-demo/permission-demo.js";
  "./pages/clientDB/permission-demo/readme.js";
  "./pages/clientDB/permission-field-simple/permission-field-simple.js";
  "./pages/clientDB/clientDB-api/clientDB-api.js";
  "./pages/clientDB/validate/validate.js";
  "./pages/validate-demo/add.js";
  "./pages/validate-demo/edit.js";
  "./pages/validate-demo/list.js";
  "./pages/validate-demo/detail.js";
  "./pages/webview/webview.js";
  "./uni_modules/uni-upgrade-center-app/pages/upgrade-popup.js";
  "./pages/cloudFunction/redis/redis.js";
  "./uni_modules/uni-upgrade-center/pages/version/list.js";
  "./uni_modules/uni-upgrade-center/pages/version/add.js";
  "./uni_modules/uni-upgrade-center/pages/version/detail.js";
  "./uni_modules/uni-id-pages/pages/register/register.js";
  "./uni_modules/uni-id-pages/pages/login/login-withoutpwd.js";
  "./uni_modules/uni-id-pages/pages/login/login-withpwd.js";
  "./uni_modules/uni-id-pages/pages/login/login-smscode.js";
  "./uni_modules/uni-id-pages/pages/userinfo/userinfo.js";
  "./uni_modules/uni-id-pages/pages/userinfo/bind-mobile/bind-mobile.js";
  "./uni_modules/uni-id-pages/pages/userinfo/cropImage/cropImage.js";
  "./uni_modules/uni-id-pages/pages/register/register-by-email.js";
  "./uni_modules/uni-id-pages/pages/retrieve/retrieve.js";
  "./uni_modules/uni-id-pages/pages/retrieve/retrieve-by-email.js";
  "./uni_modules/uni-id-pages/pages/common/webview/webview.js";
  "./uni_modules/uni-id-pages/pages/userinfo/change_pwd/change_pwd.js";
  "./uni_modules/uni-id-pages/pages/register/register-admin.js";
  "./uni_modules/uni-id-pages/pages/userinfo/set-pwd/set-pwd.js";
  "./uni_modules/uni-id-pages/pages/userinfo/deactivate/deactivate.js";
  "./uni_modules/uni-id-pages/pages/userinfo/realname-verify/realname-verify.js";
}
const _sfc_main = {
  onLaunch: async function() {
    common_vendor.index.__f__("log", "at App.vue:5", "App Launch");
    common_vendor._r.initSecureNetworkByWeixin();
  },
  mounted() {
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:18", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:21", "App Hide");
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
