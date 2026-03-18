"use strict";
const js_sdk_validator_validateFunction_word_filter = require("./validateFunction/word_filter.js");
const validator = {
  "username": {
    "rules": [
      {
        "format": "string",
        "errorMessage": "只能输入中文"
      },
      {
        "pattern": "^[\\u4e00-\\u9fa5]+$",
        "errorMessage": "只能输入中文"
      }
    ],
    "label": "真实姓名"
  },
  "gender": {
    "rules": [
      {
        "format": "int"
      },
      {
        "range": [
          {
            "text": "未知",
            "value": 0
          },
          {
            "text": "男",
            "value": 1
          },
          {
            "text": "女",
            "value": 2
          }
        ]
      }
    ],
    "defaultValue": 0,
    "label": "性别"
  },
  "birth_date": {
    "rules": [
      {
        "format": "timestamp"
      }
    ],
    "label": "生日"
  },
  "weight": {
    "rules": [
      {
        "format": "int"
      },
      {
        "minimum": 50,
        "maximum": 500,
        "exclusiveMinimum": false,
        "exclusiveMaximum": true
      }
    ],
    "label": "体重"
  },
  "mobile": {
    "rules": [
      {
        "format": "string"
      },
      {
        "pattern": "^\\+?[0-9-]{3,20}$"
      }
    ],
    "label": "手机号码"
  },
  "email": {
    "rules": [
      {
        "format": "string"
      },
      {
        "format": "email"
      }
    ],
    "label": "邮箱账号"
  },
  "url": {
    "rules": [
      {
        "format": "string"
      },
      {
        "format": "url"
      }
    ],
    "label": "个人博客"
  },
  "favorite_book_id": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "label": "喜欢的书"
  },
  "address_code": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "label": "地址"
  },
  "party_member": {
    "rules": [
      {
        "format": "bool"
      }
    ],
    "label": "是否为党员"
  },
  "hobby": {
    "rules": [
      {
        "format": "array"
      },
      {
        "range": [
          {
            "text": "唱歌",
            "value": "Sing"
          },
          {
            "text": "跳舞",
            "value": "dance"
          },
          {
            "text": "画画",
            "value": "draw"
          }
        ]
      }
    ],
    "label": "业余爱好"
  },
  "comment": {
    "rules": [
      {
        "format": "string"
      },
      {
        validateFunction: js_sdk_validator_validateFunction_word_filter.word_filter
      }
    ],
    "label": "备注"
  }
};
const enumConverter = {
  "gender_valuetotext": {
    "0": "未知",
    "1": "男",
    "2": "女"
  },
  "hobby_valuetotext": [
    {
      "text": "唱歌",
      "value": "Sing"
    },
    {
      "text": "跳舞",
      "value": "dance"
    },
    {
      "text": "画画",
      "value": "draw"
    }
  ]
};
exports.enumConverter = enumConverter;
exports.validator = validator;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/js_sdk/validator/user-info.js.map
