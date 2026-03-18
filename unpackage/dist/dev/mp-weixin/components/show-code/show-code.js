"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "show-code",
  data() {
    return {
      L: "{",
      R: "}",
      La: "[",
      Ra: "]"
    };
  },
  computed: {
    codesType() {
      return this.tf(this.codes);
    },
    isJson() {
      return this.tf(this.codes) == "json";
    },
    isObject() {
      return typeof this.codes == "object";
    }
  },
  methods: {
    classNNN() {
      return this.tf(this.codes);
    },
    tf(codes) {
      let cType = typeof codes;
      if (cType == "object") {
        if (!codes) {
          return "null";
        } else if (Array.isArray(codes)) {
          return "array";
        } else {
          return "json";
        }
      } else {
        return cType;
      }
    },
    isLast(codes, key, k) {
      if (this.isJson) {
        return Object.keys(codes).length == k + 1;
      } else {
        return codes.length == k + 1;
      }
    }
  },
  props: {
    codes: {
      default() {
        return {};
      }
    },
    kl: {
      type: Number,
      default() {
        return 0;
      }
    },
    e: {
      default() {
        return ",";
      }
    },
    last: {
      default() {
        return true;
      }
    }
  }
};
if (!Array) {
  const _easycom_show_code2 = common_vendor.resolveComponent("show-code");
  _easycom_show_code2();
}
const _easycom_show_code = () => Promise.resolve().then(() => RDovd29ya2ZpbGUvdW5pYXBwL3NpbXBsZS9haUN1cnRhaW4vY29tcG9uZW50cy9zaG93LWNvZGUvc2hvdy1jb2RlLnZ1ZQ);
if (!Math) {
  _easycom_show_code();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !$options.isObject
  }, !$options.isObject ? {
    b: common_vendor.t($props.codes),
    c: common_vendor.n($options.codesType),
    d: common_vendor.t($props.e),
    e: $props.e != ":" ? 1 : ""
  } : common_vendor.e({
    f: $options.isJson
  }, $options.isJson ? {
    g: common_vendor.t($data.L)
  } : {
    h: common_vendor.t($data.La)
  }, {
    i: common_vendor.f($props.codes, (value, key, k) => {
      return common_vendor.e($options.isJson ? {
        a: "f02b795a-0-" + k,
        b: common_vendor.p({
          codes: key,
          e: ":"
        })
      } : {}, {
        c: "f02b795a-1-" + k,
        d: common_vendor.p({
          codes: value,
          last: false,
          kl: key.length
        }),
        e: key
      });
    }),
    j: $options.isJson,
    k: $props.kl * 8 * -1 + "px",
    l: $options.isJson
  }, $options.isJson ? {
    m: common_vendor.t($data.R)
  } : {
    n: common_vendor.t($data.Ra)
  }, {
    o: !$props.last
  }, !$props.last ? {} : {}, {
    p: $props.kl * 8 * -1 + "px"
  }));
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f02b795a"]]);
wx.createComponent(Component);
const RDovd29ya2ZpbGUvdW5pYXBwL3NpbXBsZS9haUN1cnRhaW4vY29tcG9uZW50cy9zaG93LWNvZGUvc2hvdy1jb2RlLnZ1ZQ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null
}, Symbol.toStringTag, { value: "Module" }));
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/show-code/show-code.js.map
