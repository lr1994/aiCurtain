"use strict";
const common_vendor = require("../../../common/vendor.js");
function type_name_check(rule, value, data, callback) {
  common_vendor.index.__f__("log", "at js_sdk/validator/validateFunction/type_name_check.js:4", "vvvvv", data);
  if (data.type === 0 && data.type_name.length > 5) {
    callback("姓名不能超过5位数");
  }
  if (data.type === 1 && data.type_name.length < 4) {
    callback("企业名称不能低于4位数");
  }
}
exports.type_name_check = type_name_check;
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/js_sdk/validator/validateFunction/type_name_check.js.map
