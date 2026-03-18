"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      activeIndex: null,
      role: 0,
      roles: [
        {
          "value": 0,
          "text": "未登陆"
        },
        {
          "value": "user",
          "text": "用户"
        },
        {
          "value": "auditor",
          "text": "审核员"
        },
        {
          "value": "admin",
          "text": "管理员"
        }
      ],
      showGuide: false
    };
  },
  watch: {
    async activeIndex(activeIndex, oldRole) {
      let role = this.roles[activeIndex].value;
      common_vendor.index.showLoading({
        title: "切换账号类型中",
        mask: true
      });
      if (!activeIndex) {
        let res = await this.logout();
        common_vendor.index.__f__("log", "at components/set-permission/set-permission.vue:50", res);
        common_vendor.index.setStorageSync("role_index", activeIndex);
        common_vendor.index.setStorageSync("uni_id_token", false);
        common_vendor.index.setStorageSync("uni_id_uid", false);
        common_vendor.index.setStorageSync("uni_id_token_expired", false);
        this.$emit("change", { role, index: activeIndex });
        common_vendor.index.hideLoading();
        return false;
      }
      common_vendor._r.callFunction({
        name: "user-center",
        data: {
          action: "login",
          params: {
            username: role,
            password: "123456",
            needPermission: true
          }
        },
        complete: (res) => {
          common_vendor.index.setStorageSync("role_index", activeIndex);
          common_vendor.index.setStorageSync("uni_id_token", res.result.token);
          common_vendor.index.setStorageSync("uni_id_uid", res.result.uid);
          common_vendor.index.setStorageSync("uni_id_token_expired", res.result.tokenExpired);
          this.$emit("change", { role, index: activeIndex, uid: res.result.uid });
          common_vendor.index.hideLoading();
        }
      });
    }
  },
  async beforeDestroy() {
  },
  mounted() {
    this.activeIndex = common_vendor.index.getStorageSync("role_index") || 0;
  },
  methods: {
    async logout() {
      return await common_vendor._r.callFunction({
        name: "user-center",
        data: {
          action: "logout"
        }
      });
    },
    init(activeIndex) {
      this.activeIndex = activeIndex;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.showGuide
  }, $data.showGuide ? {} : {}, {
    b: common_vendor.f($data.roles, (item, index, i0) => {
      return {
        a: common_vendor.t(item.text),
        b: item.value,
        c: $data.activeIndex == index ? 1 : "",
        d: common_vendor.o(($event) => $data.activeIndex = index, item.value)
      };
    }),
    c: 170 * $data.activeIndex + "rpx",
    d: $data.showGuide
  }, $data.showGuide ? {
    e: common_vendor.o(($event) => $data.showGuide = false, "55"),
    f: common_assets._imports_0$2
  } : {}, {
    g: 170 * $data.roles.length + "rpx"
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-6d1b39f8"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/set-permission/set-permission.js.map
