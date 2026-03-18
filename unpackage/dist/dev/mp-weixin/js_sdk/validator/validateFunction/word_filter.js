"use strict";
function word_filter(rule, value, data, callback) {
  if (value.indexOf("test") != -1) {
    return "拒绝，内容含有：test";
  }
}
exports.word_filter = word_filter;
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/js_sdk/validator/validateFunction/word_filter.js.map
