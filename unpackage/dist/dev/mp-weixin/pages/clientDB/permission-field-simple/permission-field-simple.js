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
        }
        /* {
        	text: "删除",
        	value: "delete"
        } */
      ],
      typeIndex: 0,
      permissionList: [
        {
          "msg": "直接禁止",
          "field": "ip",
          "code": false,
          "explain": "禁止任何角色",
          "explain_end": "含字段ip的记录，管理员角色除外"
        },
        {
          "msg": "需要登陆",
          "field": "ip",
          "code": "auth.uid != null",
          "explain": "禁止未登陆的游客",
          "explain_end": "含字段ip的记录"
        },
        {
          "msg": "指定角色",
          "field": "ip",
          "code": "'AUDITOR' in auth.role",
          "explain": "限角色为审核",
          "explain_end": "含字段【ip】的记录"
        }
      ]
    };
  },
  created() {
    for (var j = 0; j < this.types.length; j++) {
      let type = this.types[j].value;
      common_vendor.index.__f__("log", "at pages/clientDB/permission-field-simple/permission-field-simple.vue:101", type);
      for (let i = 0; i < this.permissionList.length; i++) {
        let jsonString = `{
							"properties":{
								"${this.permissionList[i].field}":{
									"permission":{
										"${type}":"${this.permissionList[i].code}"
									}
								}
							}
					}`;
        if (!this.permissionList[i].codes)
          this.permissionList[i].codes = {};
        this.permissionList[i].codes[type] = JSON.parse(jsonString);
      }
    }
    common_vendor.index.__f__("log", "at pages/clientDB/permission-field-simple/permission-field-simple.vue:116", this.permissionList);
  },
  mounted() {
    common_vendor.index.setStorageSync("uni_id_token", "");
    common_vendor.index.setStorageSync("uni_id_token_expired", "");
  },
  methods: {
    async myFn(e) {
      common_vendor.index.__f__("log", "at pages/clientDB/permission-field-simple/permission-field-simple.vue:124", "myFun" + JSON.stringify(e));
      e.where = e.where || {};
      e.field = e.field || "_id,state,create_time,text,ip";
      let item = this.permissionList[e.index];
      let tableName = item.tableName || "permission-test-" + (e.index + 10);
      common_vendor.index.showLoading({
        mask: true
      });
      let hasIp = {};
      if (e.field.indexOf("ip") != -1) {
        hasIp = { "ip": "虚拟ip" + Date.now() };
      }
      common_vendor.index.__f__(
        "log",
        "at pages/clientDB/permission-field-simple/permission-field-simple.vue:138",
        "表名称：" + tableName + ",操作：" + this.typeText + "\n 条件：" + JSON.stringify(e.where),
        "\n field:" + e.field,
        "\n data:" + JSON.stringify({
          "text": "数据" + Date.now(),
          ...hasIp
        })
      );
      let res;
      try {
        switch (e.type) {
          case "read":
            res = await db.action(e.action).collection(tableName).where(e.where).field(e.field).get();
            break;
          case "create":
            res = await db.action(e.action).collection(tableName).add({
              "text": "默认写入的数据" + Date.now(),
              ...hasIp
            });
            break;
          case "update":
            res = await db.action(e.action).collection(tableName).where(e.where).update({
              "text": "更新后的数据" + Date.now(),
              ...hasIp
            });
            break;
          case "delete":
            res = await db.action(e.action).collection(tableName).where(e.where).remove();
            break;
          default:
            common_vendor.index.__f__("log", "at pages/clientDB/permission-field-simple/permission-field-simple.vue:173", "err 未定义事件类型");
            break;
        }
        common_vendor.index.__f__("log", "at pages/clientDB/permission-field-simple/permission-field-simple.vue:176", "res: ", res);
        this.$refs.alertCode.open(res.result);
      } catch (err) {
        common_vendor.index.__f__("log", "at pages/clientDB/permission-field-simple/permission-field-simple.vue:179", "TODO handle the exception", err);
        common_vendor.index.showModal({
          title: "错误:" + err.message + "," + err.code,
          content: item.explain + "【" + this.typeText + "字段" + item.field + "】" + (item.explain_end ? item.explain_end : ""),
          showCancel: false
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    changePermission(e) {
      common_vendor.index.__f__("log", "at pages/clientDB/permission-field-simple/permission-field-simple.vue:190", e, "切换完成");
      common_vendor.index.__f__("log", "at pages/clientDB/permission-field-simple/permission-field-simple.vue:191", "this.typeIndex: ", this.typeIndex);
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
    d: common_vendor.sr("alertCode", "ccd54dd8-2"),
    e: common_vendor.f($data.permissionList, (item, index, i0) => {
      return common_vendor.e({
        a: item.exclude !== $options.type
      }, item.exclude !== $options.type ? common_vendor.e({
        b: common_vendor.t(item.msg),
        c: common_vendor.t(index + 10),
        d: "ccd54dd8-3-" + i0,
        e: common_vendor.p({
          codes: item.codes[$options.type]
        }),
        f: common_vendor.t(item.explain),
        g: common_vendor.t($options.typeText),
        h: common_vendor.t(item.explain_end),
        i: common_vendor.t($options.typeText),
        j: $options.type != "create"
      }, $options.type != "create" ? {} : {}, {
        k: common_vendor.o(($event) => $options.myFn({
          type: $options.type,
          index
        }), "6c"),
        l: [0, 1, 2].includes(index)
      }, [0, 1, 2].includes(index) ? {
        m: common_vendor.t($options.typeText),
        n: common_vendor.t(item.field),
        o: common_vendor.o(($event) => $options.myFn({
          type: $options.type,
          index,
          field: "_id,state,create_time,text"
        }), "3a")
      } : {}) : {});
    }),
    f: common_vendor.o($options.changePermission, "39")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-ccd54dd8"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/clientDB/permission-field-simple/permission-field-simple.js.map
