"use strict";
const common_vendor = require("../../common/vendor.js");
const js_sdk_validator_userInfo = require("../../js_sdk/validator/user-info.js");
const _sfc_main = {
  data() {
    return {
      queryWhere: "",
      loadMore: {
        contentdown: "",
        contentrefresh: "",
        contentnomore: ""
      },
      options: {
        // 将scheme enum 属性静态数据中的value转成text
        ...js_sdk_validator_userInfo.enumConverter
      }
    };
  },
  onLoad(e) {
    this._id = e.id;
  },
  onReady() {
    if (this._id) {
      this.queryWhere = '_id=="' + this._id + '"';
    }
  },
  methods: {
    handleUpdate() {
      common_vendor.index.navigateTo({
        url: "./edit?id=" + this._id,
        events: {
          // 监听修改页面成功修改数据后, 刷新当前页面数据
          refreshData: () => {
            this.$refs.udb.loadData({
              clear: true
            });
          }
        }
      });
    },
    handleDelete() {
      this.$refs.udb.remove(this._id, {
        success: (res) => {
          common_vendor.index.navigateTo({
            url: "./list"
          });
        }
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  const _easycom_uni_dateformat2 = common_vendor.resolveComponent("uni-dateformat");
  const _easycom_uni_link2 = common_vendor.resolveComponent("uni-link");
  const _easycom_uni_data_picker2 = common_vendor.resolveComponent("uni-data-picker");
  const _easycom_unicloud_db2 = common_vendor.resolveComponent("unicloud-db");
  (_easycom_uni_load_more2 + _easycom_uni_dateformat2 + _easycom_uni_link2 + _easycom_uni_data_picker2 + _easycom_unicloud_db2)();
}
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
const _easycom_uni_dateformat = () => "../../uni_modules/uni-dateformat/components/uni-dateformat/uni-dateformat.js";
const _easycom_uni_link = () => "../../uni_modules/uni-link/components/uni-link/uni-link.js";
const _easycom_uni_data_picker = () => "../../uni_modules/uni-data-picker/components/uni-data-picker/uni-data-picker.js";
const _easycom_unicloud_db = () => "../../node-modules/@dcloudio/uni-components/lib/unicloud-db/unicloud-db.js";
if (!Math) {
  (_easycom_uni_load_more + _easycom_uni_dateformat + _easycom_uni_link + _easycom_uni_data_picker + _easycom_unicloud_db)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.w(({
      data,
      loading,
      error,
      options
    }, s0, i0) => {
      return common_vendor.e({
        a: error
      }, error ? {
        b: common_vendor.t(error.message)
      } : loading ? {
        d: "42dca2b6-1-" + i0 + ",42dca2b6-0",
        e: common_vendor.p({
          contentText: $data.loadMore,
          status: "loading"
        })
      } : data ? {
        g: common_vendor.t(data.username),
        h: common_vendor.t(options.gender_valuetotext[data.gender]),
        i: "42dca2b6-2-" + i0 + ",42dca2b6-0",
        j: common_vendor.p({
          threshold: [0, 0],
          date: data.birth_date
        }),
        k: common_vendor.t(data.weight),
        l: common_vendor.t(data.mobile),
        m: "42dca2b6-3-" + i0 + ",42dca2b6-0",
        n: common_vendor.p({
          href: "mailto:" + data.email,
          text: data.email
        }),
        o: "42dca2b6-4-" + i0 + ",42dca2b6-0",
        p: common_vendor.p({
          href: data.url,
          download: data.url,
          text: data.url
        }),
        q: common_vendor.t(data.favorite_book_id && data.favorite_book_id[0] && data.favorite_book_id[0].title),
        r: common_vendor.t(data.address_code && data.address_code[0] && data.address_code[0].name),
        s: common_vendor.t(data.party_member == true ? "✅" : "❌"),
        t: "42dca2b6-5-" + i0 + ",42dca2b6-0",
        v: common_vendor.p({
          localdata: options.hobby_valuetotext,
          value: data.hobby,
          multiple: false,
          readonly: true,
          arrow: false,
          split: ","
        }),
        w: common_vendor.t(data.comment)
      } : {}, {
        c: loading,
        f: data,
        x: i0,
        y: s0
      });
    }, {
      name: "d",
      path: "a",
      vueId: "42dca2b6-0"
    }),
    b: common_vendor.sr("udb", "42dca2b6-0"),
    c: common_vendor.p({
      options: $data.options,
      collection: "user-info,book,opendb-city-china",
      field: "username,gender,birth_date,weight,mobile,email,url,favorite_book_id{title},address_code{name},party_member,hobby,comment",
      where: $data.queryWhere,
      getone: true,
      manual: true
    }),
    d: common_vendor.o((...args) => $options.handleUpdate && $options.handleUpdate(...args), "29"),
    e: common_vendor.o((...args) => $options.handleDelete && $options.handleDelete(...args), "5d")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user-info/detail.js.map
