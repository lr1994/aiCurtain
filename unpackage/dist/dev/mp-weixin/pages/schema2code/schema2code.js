"use strict";
const common_vendor = require("../../common/vendor.js");
const bsonType = "object";
const required = [
  "title"
];
const permission = {
  read: true,
  create: true,
  update: true,
  "delete": true
};
const properties = {
  _id: {
    description: "ID，系统自动生成",
    foreignKey: "comment.article_id"
  },
  username: {
    bsonType: "string",
    title: "真实姓名",
    description: "限制只能输入中文",
    pattern: "^[\\u4e00-\\u9fa5]+$",
    errorMessage: "只能输入中文"
  },
  gender: {
    bsonType: "int",
    title: "性别",
    description: "用户性别：0 未知 1 男性 2 女性",
    defaultValue: 0,
    "enum": [
      {
        text: "未知",
        value: 0
      },
      {
        text: "男",
        value: 1
      },
      {
        text: "女",
        value: 2
      }
    ]
  },
  birth_date: {
    bsonType: "timestamp",
    title: "生日"
  },
  weight: {
    bsonType: "int",
    title: "体重",
    exclusiveMinimum: false,
    exclusiveMaximum: true,
    minimum: 50,
    maximum: 500,
    description: "限输入 >50 && <=500"
  },
  mobile: {
    bsonType: "string",
    title: "手机号码",
    description: "手机号码",
    pattern: "^\\+?[0-9-]{3,20}$"
  },
  email: {
    bsonType: "string",
    description: "请输入你的邮箱账号",
    title: "邮箱账号",
    format: "email"
  },
  url: {
    bsonType: "string",
    description: "请输入网址的地址",
    title: "个人博客",
    format: "url"
  },
  favorite_book_id: {
    bsonType: "string",
    title: "喜欢的书的id",
    description: "选项来源book表",
    foreignKey: "book._id",
    "enum": {
      collection: "book",
      field: "title as text, _id as value",
      orderby: "desc"
    }
  },
  address_code: {
    bsonType: "string",
    title: "地址",
    description: "城市编码",
    enumType: "tree",
    foreignKey: "opendb-city-china.code",
    "enum": {
      collection: "opendb-city-china",
      orderby: "value asc",
      field: "code as value, name as text"
    }
  },
  party_member: {
    bsonType: "bool",
    description: "字段类型为bool时，默认使用switch组件",
    title: "是否为党员"
  },
  hobby: {
    bsonType: "array",
    description: "字段类型为Array时，默认使用uni-data-checkbox组件",
    title: "业余爱好",
    "enum": [
      {
        text: "唱歌",
        value: "Sing"
      },
      {
        text: "跳舞",
        value: "dance"
      },
      {
        text: "画画",
        value: "draw"
      }
    ],
    component: {
      name: "uni-data-checkbox",
      props: {
        multiple: true
      }
    }
  },
  comment: {
    bsonType: "string",
    title: "备注",
    description: "拒绝违禁词,如：test",
    validateFunction: "word_filter",
    component: {
      name: "textarea"
    }
  },
  create_time: {
    bsonType: "timestamp",
    description: "创建时间",
    forceDefaultValue: {
      $env: "now"
    }
  },
  ip: {
    bsonType: "string",
    forceDefaultValue: {
      $env: "clientIP"
    }
  }
};
const schemaCode = {
  bsonType,
  required,
  permission,
  properties
};
const _sfc_main = {
  data() {
    return {
      schemaCode,
      videoUrl: "https://web-assets.dcloud.net.cn/unidoc/zh/schema2code%E7%9A%84%E4%B8%A4%E7%A7%8D%E6%96%B9%E5%BC%8F.mp4"
      // https://web-assets.dcloud.net.cn/unidoc/zh/create-schema2code-video.mp4
    };
  },
  methods: {
    async showSchemaCode() {
      return this.$refs.alertCode.open(schemaCode);
    },
    toForm() {
      common_vendor.index.navigateTo({
        url: "../user-info/list"
      });
    }
  }
};
if (!Array) {
  const _easycom_j_video2 = common_vendor.resolveComponent("j-video");
  const _easycom_alertCode2 = common_vendor.resolveComponent("alertCode");
  (_easycom_j_video2 + _easycom_alertCode2)();
}
const _easycom_j_video = () => "../../components/j-video/j-video.js";
const _easycom_alertCode = () => "../../components/alertCode/alertCode.js";
if (!Math) {
  (_easycom_j_video + _easycom_alertCode)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.showSchemaCode && $options.showSchemaCode(...args), "92"),
    b: common_vendor.p({
      src: $data.videoUrl,
      title: "schema2code步骤演示",
      height: "421rpx",
      width: "750rpx"
    }),
    c: common_vendor.sr("alertCode", "d1e4428e-1"),
    d: common_vendor.o((...args) => $options.toForm && $options.toForm(...args), "a1")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d1e4428e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/schema2code/schema2code.js.map
