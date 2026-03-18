"use strict";
const common_vendor = require("../../../common/vendor.js");
const db = common_vendor._r.database();
const alertCode = () => "../../../components/alertCode/alertCode.js";
const uniNoticeBar = () => "../../../uni_modules/uni-notice-bar/components/uni-notice-bar/uni-notice-bar.js";
const _sfc_main = {
  components: {
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
  created() {
    for (var j = 0; j < this.types.length; j++) {
      let type = this.types[j].value;
      common_vendor.index.__f__("log", "at pages/clientDB/permission-table-compound/permission-table-compound.vue:58", type);
      for (let i = 0; i < this.permissionList.length; i++) {
        let jsonString = `{
							"permission":{
								"${type}":"${this.permissionList[i].code}"
							}
					}`;
        if (!this.permissionList[i].codes)
          this.permissionList[i].codes = {};
        this.permissionList[i].codes[type] = JSON.parse(jsonString);
      }
    }
    common_vendor.index.__f__("log", "at pages/clientDB/permission-table-compound/permission-table-compound.vue:69", this.permissionList);
  },
  data() {
    return {
      currentRole: 0,
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
      permissionList: [
        {
          "msg": "交集表达式",
          "code": "doc.create_time > (now - 60000) && 'AUDITOR' in auth.role",
          "explain": "限1分钟内的数据，“且”角色必须为审核员",
          "exclude": "create"
        },
        {
          "msg": "并集表达式",
          "code": "auth.uid != null || 'add_view_count' in action",
          "explain": "限非未登陆的游客，“或”带action",
          "tableName": "permission-test-9"
        }
      ]
    };
  },
  mounted() {
    common_vendor.index.setStorageSync("uni_id_token", "");
    common_vendor.index.setStorageSync("uni_id_token_expired", "");
  },
  methods: {
    async myFn(e) {
      common_vendor.index.__f__("log", "at pages/clientDB/permission-table-compound/permission-table-compound.vue:115", "myFun" + JSON.stringify(e));
      e.where = e.where || {};
      let item = this.permissionList[e.index];
      let tableName = item.tableName || "permission-test-" + (e.index + 8);
      common_vendor.index.showLoading({
        mask: true
      });
      common_vendor.index.__f__(
        "log",
        "at pages/clientDB/permission-table-compound/permission-table-compound.vue:123",
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
            common_vendor.index.__f__("log", "at pages/clientDB/permission-table-compound/permission-table-compound.vue:155", "err 未定义事件类型");
            break;
        }
        common_vendor.index.__f__("log", "at pages/clientDB/permission-table-compound/permission-table-compound.vue:158", "res: ", res);
        this.$refs.alertCode.open(res.result);
      } catch (err) {
        common_vendor.index.__f__("log", "at pages/clientDB/permission-table-compound/permission-table-compound.vue:161", "TODO handle the exception", err);
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
      common_vendor.index.__f__("log", "at pages/clientDB/permission-table-compound/permission-table-compound.vue:172", e, "切换完成");
      common_vendor.index.__f__("log", "at pages/clientDB/permission-table-compound/permission-table-compound.vue:173", "this.typeIndex: ", this.typeIndex);
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
      current: $data.typeIndex,
      values: $data.types.map(({
        text
      }) => text)
    }),
    d: common_vendor.sr("alertCode", "2dfb0dd9-2"),
    e: common_vendor.f($data.permissionList, (item, index, i0) => {
      return common_vendor.e({
        a: item.exclude !== $options.type
      }, item.exclude !== $options.type ? common_vendor.e({
        b: common_vendor.t(item.msg),
        c: common_vendor.t(index + 8),
        d: "2dfb0dd9-3-" + i0,
        e: common_vendor.p({
          codes: item.codes[$options.type]
        }),
        f: common_vendor.t(item.explain),
        g: common_vendor.t($data.types[$data.typeIndex].text),
        h: common_vendor.t(item.explain_end),
        i: index === 0 && $options.type != "create"
      }, index === 0 && $options.type != "create" ? {
        j: common_vendor.o(($event) => $options.myFn({
          type: "create",
          index
        }), "85"),
        k: common_vendor.t($options.typeText),
        l: common_vendor.o(($event) => $options.myFn({
          type: "read",
          index,
          where: "create_time > " + (Date.now() - 6e4)
        }), "67")
      } : {}, {
        m: common_vendor.t($data.types[$data.typeIndex].text),
        n: $options.type != "create"
      }, $options.type != "create" ? {} : {}, {
        o: common_vendor.o(($event) => $options.myFn({
          type: $options.type,
          index
        }), "c9"),
        p: index === 1
      }, index === 1 ? {
        q: common_vendor.t($data.types[$data.typeIndex].text),
        r: common_vendor.o(($event) => $options.myFn({
          type: $options.type,
          index,
          action: "add_view_count"
        }), "94")
      } : {}) : {});
    }),
    f: common_vendor.o($options.changePermission, "66")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-2dfb0dd9"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/clientDB/permission-table-compound/permission-table-compound.js.map
