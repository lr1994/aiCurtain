"use strict";
const common_vendor = require("../../common/vendor.js");
const js_sdk_validator_validateDemo = require("../../js_sdk/validator/validate-demo.js");
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
        ...js_sdk_validator_validateDemo.enumConverter
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
        url: "/pages/validate-demo/edit?id=" + this._id,
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
            url: "/pages/validate-demo/list"
          });
        }
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  const _easycom_uni_data_picker2 = common_vendor.resolveComponent("uni-data-picker");
  const _easycom_unicloud_db2 = common_vendor.resolveComponent("unicloud-db");
  (_easycom_uni_load_more2 + _easycom_uni_data_picker2 + _easycom_unicloud_db2)();
}
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
const _easycom_uni_data_picker = () => "../../uni_modules/uni-data-picker/components/uni-data-picker/uni-data-picker.js";
const _easycom_unicloud_db = () => "../../node-modules/@dcloudio/uni-components/lib/unicloud-db/unicloud-db.js";
if (!Math) {
  (_easycom_uni_load_more + _easycom_uni_data_picker + _easycom_unicloud_db)();
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
        d: "7a75f2a8-1-" + i0 + ",7a75f2a8-0",
        e: common_vendor.p({
          contentText: $data.loadMore,
          status: "loading"
        })
      } : data ? {
        g: common_vendor.t(options.type_valuetotext[data.type]),
        h: common_vendor.t(data.type_name),
        i: common_vendor.t(data.comment),
        j: common_vendor.t(data.username),
        k: common_vendor.t(data.email),
        l: common_vendor.t(data.dowload_url),
        m: common_vendor.t(data.weight),
        n: common_vendor.t(data.favorite_book[0].title),
        o: common_vendor.t(data.party_member),
        p: "7a75f2a8-2-" + i0 + ",7a75f2a8-0",
        q: common_vendor.p({
          localdata: options.hobby_valuetotext,
          value: data.hobby,
          multiple: true,
          readonly: true,
          arrow: false,
          border: false,
          split: ","
        }),
        r: common_vendor.t(data.address[0].name)
      } : {}, {
        c: loading,
        f: data,
        s: i0,
        t: s0
      });
    }, {
      name: "d",
      path: "a",
      vueId: "7a75f2a8-0"
    }),
    b: common_vendor.sr("udb", "7a75f2a8-0"),
    c: common_vendor.p({
      options: $data.options,
      collection: "validate-demo,book,opendb-city-china",
      field: "type,type_name,comment,username,email,dowload_url,weight,favorite_book{title},party_member,hobby,address{name}",
      where: $data.queryWhere,
      getone: true,
      manual: true
    }),
    d: common_vendor.o((...args) => $options.handleUpdate && $options.handleUpdate(...args), "17"),
    e: common_vendor.o((...args) => $options.handleDelete && $options.handleDelete(...args), "c3")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/validate-demo/detail.js.map
