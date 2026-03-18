"use strict";
const js_sdk_validator_validateFunction_type_name_check = require("./validateFunction/type_name_check.js");
const js_sdk_validator_validateFunction_word_filter = require("./validateFunction/word_filter.js");
const validator = {
  "type": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "int"
      },
      {
        "range": [
          {
            "text": "个人",
            "value": 0
          },
          {
            "text": "企业",
            "value": 1
          }
        ]
      }
    ],
    "label": "主体"
  },
  "type_name": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      },
      {
        validateFunction: js_sdk_validator_validateFunction_type_name_check.type_name_check
      }
    ],
    "label": "主体名称"
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
  },
  "username": {
    "rules": [
      {
        "format": "string",
        "errorMessage": "只能输入中文"
      },
      {
        "pattern": "[一-龥]",
        "errorMessage": "只能输入中文"
      }
    ],
    "label": "负责人姓名"
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
    "label": "邮箱"
  },
  "dowload_url": {
    "rules": [
      {
        "format": "string"
      },
      {
        "format": "url"
      }
    ],
    "label": "下载地址"
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
  "favorite_book": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "label": "喜欢的书"
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
  "address": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "label": "地址"
  }
};
const enumConverter = {
  "type_valuetotext": {
    "0": "个人",
    "1": "企业"
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
//# sourceMappingURL=../../../.sourcemap/mp-weixin/js_sdk/validator/validate-demo.js.map
