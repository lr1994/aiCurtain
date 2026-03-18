"use strict";
const common_vendor = require("../../../common/vendor.js");
const db = common_vendor._r.database();
const uniNoticeBar = () => "../../../uni_modules/uni-notice-bar/components/uni-notice-bar/uni-notice-bar.js";
const _sfc_main = {
  components: {
    uniNoticeBar
  },
  data() {
    return {
      noticeData: {
        "_id": null
      },
      currentRole: 0,
      options: {
        "selfId": "",
        "where": "",
        // 默认为空，在查到公告内容后设置
        role: {
          index: 0
        }
      },
      activeNoticeId: false,
      defaultText: "",
      fields: "data",
      swipeActionOptions: [
        {
          text: "编辑",
          style: {
            backgroundColor: "#007aff"
          }
        },
        {
          text: "删除",
          style: {
            backgroundColor: "#dd524d"
          }
        }
      ]
    };
  },
  onLoad() {
    this.getNoticeData();
  },
  onReady() {
  },
  methods: {
    tipLogin() {
      common_vendor.index.showModal({
        content: "未登陆游客不能写留言！可在底部工具条切换成其他角色体验",
        showCancel: false,
        confirmText: "知道了"
      });
    },
    changePermission(role) {
      common_vendor.index.__f__("log", "at pages/clientDB/demo/demo.vue:108", "role: ", role);
      this.options.selfId = role.uid;
      switch (role.index) {
        case 0:
          this.options.where = `state == 1 && notice_id == "${this.noticeData._id}"`;
          break;
        case 1:
          this.options.where = `state == 1 && notice_id == "${this.noticeData._id}" || user_id._id==$env.uid`;
          break;
        case 2:
          this.options.where = { "notice_id": this.noticeData._id };
          break;
        case 3:
          this.options.where = { "notice_id": this.noticeData._id };
          break;
      }
      this.options.role = role;
      this.currentRole = role.role;
    },
    async getNoticeData() {
      let res = await db.action("add_view_count").collection("opendb-notice").doc("65365ac355b3379a66170144").field("data,_id,update_time,view_count").get();
      common_vendor.index.__f__("log", "at pages/clientDB/demo/demo.vue:135", "res: ", res);
      this.noticeData = res.result.data[0];
      this.options.where = `state == 1 && notice_id == "${this.noticeData._id}"`;
    },
    async clickIcon(e, item) {
      if (e) {
        await this.$refs.udb.remove(item._id);
      } else {
        this.defaultText = item.text;
        this.activeNoticeId = item._id;
        this.$refs.upDataDialog.open();
      }
    },
    updateState(e, _id) {
      common_vendor.index.__f__("log", "at pages/clientDB/demo/demo.vue:149", e.detail.value, _id);
      common_vendor.index.showLoading({
        mask: true
      });
      db.collection("opendb-notice-comment").doc(_id).update({
        "state": e.detail.value / 1
      }).then(({ code, message }) => {
        common_vendor.index.showToast({
          title: "已切换为:" + (e.detail.value ? "审核通过" : "审核中"),
          icon: "none",
          duration: 3e3
        });
        common_vendor.index.__f__("log", "at pages/clientDB/demo/demo.vue:164", code, message);
      }).catch(({ code, message }) => {
        common_vendor.index.__f__("log", "at pages/clientDB/demo/demo.vue:166", code, message);
      }).finally((e2) => {
        common_vendor.index.hideLoading();
        this.$refs.upDataDialog.close();
      });
    },
    async updateComment(text) {
      common_vendor.index.__f__("log", "at pages/clientDB/demo/demo.vue:173", text);
      common_vendor.index.__f__("log", "at pages/clientDB/demo/demo.vue:174", this.activeNoticeId);
      if (this.defaultText == text) {
        common_vendor.index.showToast({
          title: "内容未被修改",
          icon: "none"
        });
        this.$refs.upDataDialog.close();
        return false;
      }
      common_vendor.index.showLoading({
        mask: true
      });
      await this.$refs.udb.update(this.activeNoticeId, { text }, {
        action: "up_comment",
        toastTitle: "修改成功",
        // toast提示语
        success: (res) => {
          const {
            code,
            message
          } = res;
          common_vendor.index.__f__("log", "at pages/clientDB/demo/demo.vue:195", code, message);
          this.$refs.udb.dataList.forEach((item, index) => {
            if (item._id == this.activeNoticeId) {
              this.$refs.udb.dataList[index].text = text;
              if (this.options.role.index === 1) {
                this.$refs.udb.dataList[index].state = 0;
              }
            }
          });
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/clientDB/demo/demo.vue:207", "err: ", err);
        },
        complete: () => {
          common_vendor.index.hideLoading();
          this.$refs.upDataDialog.close();
        }
      });
    },
    async submitComment(text) {
      common_vendor.index.__f__("log", "at pages/clientDB/demo/demo.vue:217", text);
      if (!text) {
        common_vendor.index.showToast({
          title: "留言内容不能为空",
          icon: "none"
        });
        return false;
      }
      this.$refs.dialog.close();
      await db.collection("opendb-notice-comment").add({
        notice_id: this.noticeData._id,
        text
      }).then((res) => {
        common_vendor.index.__f__("log", "at pages/clientDB/demo/demo.vue:230", res);
        this.getNewData();
      }).catch(({
        code,
        message
      }) => {
        if (code == "TOKEN_INVALID_ANONYMOUS_USER") {
          common_vendor.index.showModal({
            content: "未登陆游客不能写留言",
            showCancel: false
          });
        }
        if (code == "VALIDATION_ERROR") {
          common_vendor.index.showModal({
            content: message,
            showCancel: false
          });
        }
        common_vendor.index.__f__("log", "at pages/clientDB/demo/demo.vue:248", code, message);
      });
    },
    getNewData() {
      this.$refs.udb.refresh();
    },
    getUserImg(e) {
      switch (e) {
        case "admin":
          return "../../../static/userImg/2.png";
        case "user":
          return "../../../static/userImg/0.png";
        case "auditor":
          return "../../../static/userImg/1.png";
        default:
          return "../../../static/userImg/0.png";
      }
    }
  }
};
if (!Array) {
  const _component_uniNoticeBar = common_vendor.resolveComponent("uniNoticeBar");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_unicloud_db2 = common_vendor.resolveComponent("unicloud-db");
  const _easycom_uni_popup_dialog2 = common_vendor.resolveComponent("uni-popup-dialog");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  const _easycom_uni_section2 = common_vendor.resolveComponent("uni-section");
  const _easycom_uni_list_item2 = common_vendor.resolveComponent("uni-list-item");
  const _easycom_set_permission2 = common_vendor.resolveComponent("set-permission");
  (_component_uniNoticeBar + _easycom_uni_icons2 + _easycom_unicloud_db2 + _easycom_uni_popup_dialog2 + _easycom_uni_popup2 + _easycom_uni_section2 + _easycom_uni_list_item2 + _easycom_set_permission2)();
}
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_unicloud_db = () => "../../../node-modules/@dcloudio/uni-components/lib/unicloud-db/unicloud-db.js";
const _easycom_uni_popup_dialog = () => "../../../uni_modules/uni-popup/components/uni-popup-dialog/uni-popup-dialog.js";
const _easycom_uni_popup = () => "../../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
const _easycom_uni_section = () => "../../../components/uni-section/uni-section.js";
const _easycom_uni_list_item = () => "../../../uni_modules/uni-list/components/uni-list-item/uni-list-item.js";
const _easycom_set_permission = () => "../../../components/set-permission/set-permission.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_unicloud_db + _easycom_uni_popup_dialog + _easycom_uni_popup + _easycom_uni_section + _easycom_uni_list_item + _easycom_set_permission)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.noticeData.data
  }, $data.noticeData.data ? {
    b: common_vendor.p({
      showIcon: "true",
      text: $data.noticeData.data
    })
  } : {}, {
    c: common_vendor.t($data.noticeData.view_count),
    d: common_vendor.o(($event) => _ctx.$refs.helpPopup.open(), "d5"),
    e: common_vendor.p({
      size: "14",
      color: "#aaaaaa",
      type: "info"
    }),
    f: common_vendor.o(($event) => $data.options.selfId ? _ctx.$refs.dialog.open() : $options.tipLogin(), "87"),
    g: $data.noticeData._id
  }, $data.noticeData._id ? {
    h: common_vendor.w(({
      data,
      loading,
      error,
      options
    }, s0, i0) => {
      return common_vendor.e({
        a: data.length
      }, data.length ? {
        b: common_vendor.f(data, (item, index, i1) => {
          return common_vendor.e({
            a: "../../../static/userImg/" + item.user_id[0].nickname + ".png",
            b: common_vendor.t(item.user_id[0].nickname),
            c: common_vendor.t(item.text)
          }, options.role.index > 1 ? {
            d: item.state == 1,
            e: common_vendor.o(($event) => $options.updateState($event, item._id), item._id)
          } : {}, {
            f: options.selfId == item.user_id[0]._id || options.role.index > 1
          }, options.selfId == item.user_id[0]._id || options.role.index > 1 ? common_vendor.e({
            g: options.role.index === 1 && item.state == 0
          }, options.role.index === 1 && item.state == 0 ? {} : {
            h: common_vendor.o(($event) => $options.clickIcon(0, item), item._id),
            i: "08e3f504-3-" + i0 + "-" + i1 + ",08e3f504-2",
            j: common_vendor.p({
              color: "#cdcfd4",
              size: "16",
              type: "compose"
            })
          }, {
            k: common_vendor.o(($event) => $options.clickIcon(1, item), item._id),
            l: "08e3f504-4-" + i0 + "-" + i1 + ",08e3f504-2",
            m: common_vendor.p({
              color: "#cdcfd4",
              size: "16",
              type: "trash"
            })
          }) : {}, {
            n: item._id
          });
        }),
        c: options.role.index > 1
      } : {}, {
        d: i0,
        e: s0
      });
    }, {
      name: "d",
      path: "h",
      vueId: "08e3f504-2"
    }),
    i: common_vendor.sr("udb", "08e3f504-2"),
    j: common_vendor.p({
      options: $data.options,
      ["page-data"]: "replace",
      collection: "opendb-notice-comment,uni-id-users",
      field: "user_id{nickname,_id},text,_id,state",
      where: $data.options.where
    })
  } : {}, {
    k: common_vendor.o($options.submitComment, "13"),
    l: common_vendor.p({
      mode: "input",
      title: "提交留言",
      placeholder: "留言内容不能含单词test"
    }),
    m: common_vendor.sr("dialog", "08e3f504-5"),
    n: common_vendor.p({
      type: "dialog"
    }),
    o: common_vendor.o($options.updateComment, "cc"),
    p: common_vendor.p({
      mode: "input",
      value: $data.defaultText,
      title: "更新留言",
      placeholder: "留言内容不能含单词test"
    }),
    q: common_vendor.sr("upDataDialog", "08e3f504-7"),
    r: common_vendor.p({
      type: "dialog"
    }),
    s: common_vendor.p({
      title: "demo说明",
      type: "line"
    }),
    t: common_vendor.p({
      title: "发表留言",
      note: "未登陆用户不能发表留言,你可以尝试切换账号类型为未登陆,发表留言后会被拒绝请求"
    }),
    v: common_vendor.p({
      title: "敏感词过滤",
      note: "发表留言内容含test会被拦截请求"
    }),
    w: common_vendor.p({
      title: "编辑/删除留言",
      note: "限用户编辑或删除自己发表的留言.管理员可以删除/编辑任何人的留言"
    }),
    x: common_vendor.p({
      title: "公告的阅读量",
      note: "1.读取,限登陆用户查看文章阅读量; \\n 2.自增,阅读量自动增加由特殊的云函数add_view_count完成"
    }),
    y: common_vendor.p({
      title: "数据查询",
      note: "完整留言数据,由opendb-notice-comment,uni-id-users连张表,通过foreignKey联查获取"
    }),
    z: common_vendor.sr("helpPopup", "08e3f504-9"),
    A: common_vendor.p({
      type: "center"
    }),
    B: common_vendor.o($options.changePermission, "32")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-08e3f504"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/clientDB/demo/demo.js.map
