"use strict";
const common_vendor = require("../../../common/vendor.js");
const db = common_vendor._r.database();
const uniNoticeBar = () => "../../../uni_modules/uni-notice-bar/components/uni-notice-bar/uni-notice-bar.js";
const alertCode = () => "../../../components/alertCode/alertCode.js";
const _sfc_main = {
  components: {
    // uniPopup,
    // uniPopupMessage,
    // uniPopupDialog,
    uniNoticeBar,
    alertCode
  },
  computed: {
    type() {
      return this.types[this.typeIndex].value;
    },
    typeText() {
      return this.types[this.typeIndex].text;
    }
  },
  data() {
    return {
      "currentRole": 0,
      lll: '"permission":{',
      types: [
        {
          text: "创建",
          value: "create"
        },
        {
          text: "读取",
          value: "read"
        },
        {
          text: "更新",
          value: "update"
        },
        {
          text: "删除",
          value: "delete"
        }
      ],
      typeIndex: 0,
      permissionList: [{
        "msg": "无任何限制",
        "code": true,
        "explain": "允许任何角色",
        "explain_end": "本表"
      }, {
        "msg": "完全拒绝",
        "code": false,
        "explain": "禁止任何角色",
        "explain_end": "，管理员角色除外"
      }, {
        "msg": "需要登陆",
        "code": '"auth.uid != null"',
        "explain": "需要登陆后，换句话说限制：未登陆游客"
      }, {
        "msg": "仅限自己创建",
        "code": '"doc.uid == auth.uid"',
        "explain": "只能",
        "explain_end": "自己创建的数据",
        "exclude": "create"
      }, {
        "msg": "表达式限制",
        "code": '"doc.create_time > (now - 60000)"',
        "explain": "只能",
        "explain_end": "1分钟内创建的数据",
        "exclude": "create"
      }, {
        "msg": "限特定角色",
        "code": `"'AUDITOR' in auth.role"`,
        "explain": "限审核员角色"
      }, {
        "msg": "读取必须带上action",
        "code": `"'add_view_count' in action"`,
        "explain": "数据操作",
        "explain_end": "请求同时必须同时附带执行一个action云函数，如未触发该action则权限验证失败"
      }]
    };
  },
  mounted() {
    common_vendor.index.setStorageSync("uni_id_token", "");
    common_vendor.index.setStorageSync("uni_id_token_expired", "");
  },
  created() {
    for (var j = 0; j < this.types.length; j++) {
      let type = this.types[j].value;
      for (let i = 0; i < this.permissionList.length; i++) {
        let jsonString = `{
							"permission":{
								"${type}":${this.permissionList[i].code}
							}
					}`;
        if (!this.permissionList[i].codes)
          this.permissionList[i].codes = {};
        this.permissionList[i].codes[type] = JSON.parse(jsonString);
      }
    }
    common_vendor.index.__f__("log", "at pages/clientDB/permission-table-simple/permission-table-simple.vue:152", this.permissionList);
  },
  methods: {
    async myFn(e) {
      common_vendor.index.__f__("log", "at pages/clientDB/permission-table-simple/permission-table-simple.vue:156", "myFun" + JSON.stringify(e));
      e.where = e.where || {};
      let item = this.permissionList[e.index];
      let tableName = item.tableName || "permission-test-" + (e.index + 1);
      common_vendor.index.showLoading({
        mask: true
      });
      common_vendor.index.__f__(
        "log",
        "at pages/clientDB/permission-table-simple/permission-table-simple.vue:164",
        "表名称：" + tableName + "\n 条件：" + JSON.stringify(e.where)
      );
      let res;
      try {
        switch (e.type) {
          case "read":
            res = await db.action(e.action).collection(tableName).where(e.where).get();
            if (res.result.data.length == 0) {
              common_vendor.index.showModal({
                title: "数据为空，请先点击创建数据",
                showCancel: false
              });
              return false;
            }
            break;
          case "create":
            res = await db.action(e.action).collection(tableName).add({
              "text": "默认写入的数据" + Date.now()
            });
            break;
          case "update":
            res = await db.action(e.action).collection(tableName).where(e.where).update({
              "text": "更新后的数据" + Date.now()
            });
            break;
          case "delete":
            res = await db.action(e.action).collection(tableName).where(e.where).remove();
            break;
          default:
            common_vendor.index.__f__("log", "at pages/clientDB/permission-table-simple/permission-table-simple.vue:196", "err 未定义事件类型");
            break;
        }
        common_vendor.index.__f__("log", "at pages/clientDB/permission-table-simple/permission-table-simple.vue:199", "res: ", res);
        this.$refs.alertCode.open(res.result);
      } catch (err) {
        common_vendor.index.__f__("log", "at pages/clientDB/permission-table-simple/permission-table-simple.vue:202", "TODO handle the exception", err);
        common_vendor.index.showModal({
          title: "错误:" + err.message + "," + err.code,
          content: item.explain + "【" + this.typeText + "数据】" + (item.explain_end ? item.explain_end : ""),
          showCancel: false
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    changePermission(e) {
      common_vendor.index.__f__("log", "at pages/clientDB/permission-table-simple/permission-table-simple.vue:213", e, "切换完成");
      common_vendor.index.__f__("log", "at pages/clientDB/permission-table-simple/permission-table-simple.vue:214", "role: ", e.role);
      common_vendor.index.__f__("log", "at pages/clientDB/permission-table-simple/permission-table-simple.vue:215", "typeIndex: ", this.typeIndex);
      this.currentRole = e.role;
    }
  }
};
if (!Array) {
  const _component_uniNoticeBar = common_vendor.resolveComponent("uniNoticeBar");
  const _easycom_uni_segmented_control2 = common_vendor.resolveComponent("uni-segmented-control");
  const _easycom_alertCode2 = common_vendor.resolveComponent("alertCode");
  const _easycom_show_code2 = common_vendor.resolveComponent("show-code");
  const _easycom_set_permission2 = common_vendor.resolveComponent("set-permission");
  (_component_uniNoticeBar + _easycom_uni_segmented_control2 + _easycom_alertCode2 + _easycom_show_code2 + _easycom_set_permission2)();
}
const _easycom_uni_segmented_control = () => "../../../uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.js";
const _easycom_alertCode = () => "../../../components/alertCode/alertCode.js";
const _easycom_show_code = () => "../../../components/show-code/show-code.js";
const _easycom_set_permission = () => "../../../components/set-permission/set-permission.js";
if (!Math) {
  (_easycom_uni_segmented_control + _easycom_alertCode + _easycom_show_code + _easycom_set_permission)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.p({
      showIcon: "true",
      iconType: "info",
      text: "管理员(admin)拥有任何权限,权限控制对其无效。"
    }),
    b: common_vendor.o(($event) => $data.typeIndex = $event.currentIndex, "12"),
    c: common_vendor.p({
      values: $data.types.map(({
        text
      }) => text)
    }),
    d: common_vendor.sr("alertCode", "24f861d1-2"),
    e: common_vendor.f($data.permissionList, (item, index, i0) => {
      return common_vendor.e({
        a: item.exclude !== $options.type
      }, item.exclude !== $options.type ? common_vendor.e({
        b: common_vendor.t(item.msg),
        c: common_vendor.t(index + 1),
        d: "24f861d1-3-" + i0,
        e: common_vendor.p({
          codes: item.codes[$options.type]
        }),
        f: common_vendor.t(item.explain),
        g: common_vendor.t($options.typeText),
        h: common_vendor.t(item.explain_end),
        i: index == 3 && $options.type != "add"
      }, index == 3 && $options.type != "add" ? {
        j: common_vendor.o(($event) => $options.myFn({
          type: "create",
          index
        }), "7b"),
        k: common_vendor.t($options.typeText),
        l: common_vendor.o(($event) => $options.myFn({
          type: $options.type,
          index,
          where: "uid == $env.uid"
        }), "60")
      } : {}, {
        m: index == 4 && $options.type != "add"
      }, index == 4 && $options.type != "add" ? {
        n: common_vendor.o(($event) => $options.myFn({
          type: "create",
          index
        }), "5a"),
        o: common_vendor.t($options.typeText),
        p: common_vendor.o(($event) => $options.myFn({
          type: $options.type,
          index,
          where: "create_time > " + (Date.now() - 6e4)
        }), "44")
      } : {}, {
        q: common_vendor.t($options.typeText),
        r: $options.type != "create"
      }, $options.type != "create" ? {} : {}, {
        s: common_vendor.o(($event) => $options.myFn({
          type: $options.type,
          index
        }), "9d"),
        t: index == 6
      }, index == 6 ? common_vendor.e({
        v: common_vendor.t($options.typeText),
        w: $options.type != "create"
      }, $options.type != "create" ? {} : {}, {
        x: common_vendor.o(($event) => $options.myFn({
          type: $options.type,
          index,
          action: "add_view_count"
        }), "1a")
      }) : {}) : {});
    }),
    f: common_vendor.o($options.changePermission, "e2")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-24f861d1"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/clientDB/permission-table-simple/permission-table-simple.js.map
