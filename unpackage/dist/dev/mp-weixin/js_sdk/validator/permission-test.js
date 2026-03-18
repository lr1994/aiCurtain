"use strict";
const validator = {
  "nickname": {
    "rules": [
      {
        "format": "string"
      }
    ]
  },
  "username": {
    "rules": [
      {
        "format": "string"
      }
    ]
  },
  "state": {
    "rules": [
      {
        "format": "int"
      }
    ],
    "defaultValue": 0
  },
  "phone": {
    "rules": [
      {
        "format": "string"
      }
    ]
  }
};
exports.validator = validator;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/js_sdk/validator/permission-test.js.map
