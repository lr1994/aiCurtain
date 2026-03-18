"use strict";
const common_vendor = require("../../../common/vendor.js");
var udb;
const showCode = () => "../../../components/show-code/show-code.js";
const _sfc_main = {
  components: { showCode },
  data() {
    return {
      options: { a: "123" },
      collection: "order",
      fields: ["book_id", "create_date", "quantity"],
      field: ["book_id", "create_date", "quantity"],
      pageData: "replace",
      pageDataList: [{ "text": "add", value: "add" }, { "text": "replace", value: "replace" }],
      pageSize: 2,
      orderbyArr: [],
      orderbyObj: {},
      orderby: "",
      getone: false,
      pageCurrent: 1,
      getcount: true,
      L: "{",
      R: "}",
      dataList: []
    };
  },
  mounted() {
    udb = this.$refs.udb;
  },
  onLoad() {
    setTimeout(() => {
      this.dataList = this.$refs.udb.dataList;
    }, 2e3);
  },
  watch: {
    field(field, oldValue) {
      if (field.length === 0) {
        common_vendor.index.showModal({
          title: "当前field为空",
          content: "即表示显示所有字段",
          showCancel: false,
          confirmText: "知道了"
        });
      }
    },
    pageData(pageData) {
      if (pageData == "add") {
        this.$nextTick(() => {
          udb.loadData({ clear: true });
        });
      }
    },
    getone() {
      udb.loadData({ clear: true });
    }
  },
  methods: {
    changePageCurrent(e) {
      if (e / 1 > 0) {
        this.pageCurrent = e;
      }
    },
    async setOrderby({ detail: { value } }) {
      let arr = Object.keys(this.orderbyObj);
      if (arr.length > value.length) {
        for (let key in this.orderbyObj) {
          if (!value.includes(key)) {
            delete this.orderbyObj[key];
          }
        }
      } else {
        await new Promise((callback) => {
          value.forEach(async (key) => {
            if (!this.orderbyObj[key]) {
              let itemList = ["asc", "desc"];
              common_vendor.index.showActionSheet({
                itemList,
                success: ({ tapIndex }) => {
                  this.orderbyObj[key] = itemList[tapIndex];
                },
                fail: (err) => {
                  common_vendor.index.__f__("log", "at pages/clientDB/unicloud-db-demo/unicloud-db-demo.vue:175", err);
                  this.orderbyArr = arr;
                },
                complete() {
                  callback();
                }
              });
            }
          });
        });
      }
      let orderby = "";
      for (let key in this.orderbyObj) {
        orderby += key + " " + this.orderbyObj[key] + ",";
      }
      orderby = orderby.slice(0, orderby.length - 1);
      common_vendor.index.__f__("log", "at pages/clientDB/unicloud-db-demo/unicloud-db-demo.vue:191", "orderby", orderby);
      this.orderby = orderby;
    },
    mArrJson(arr) {
      let arrJson = [];
      arr.forEach((i) => {
        arrJson.push({ "text": i, value: i });
      });
      return arrJson;
    },
    async add() {
      await udb.add({
        book_id: "add-test",
        quantity: Date.now()
      }, {
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/clientDB/unicloud-db-demo/unicloud-db-demo.vue:207", "res.result: ", res.result);
          this.getFn();
          return res;
        }
      });
    },
    remove() {
      const _id = udb.dataList[0]._id;
      udb.remove(_id);
    },
    update() {
      const _id = udb.dataList[0]._id;
      udb.update(
        _id,
        { book_id: "这条数据被改" },
        {
          success: (res) => {
            this.getFn();
          }
        }
      );
    },
    getFn() {
      udb.loadData();
    },
    linkGetFn() {
    }
  }
};
if (!Array) {
  const _component_showCode = common_vendor.resolveComponent("showCode");
  const _easycom_unicloud_db2 = common_vendor.resolveComponent("unicloud-db");
  const _easycom_uni_data_checkbox2 = common_vendor.resolveComponent("uni-data-checkbox");
  const _easycom_uni_number_box2 = common_vendor.resolveComponent("uni-number-box");
  (_component_showCode + _easycom_unicloud_db2 + _easycom_uni_data_checkbox2 + _easycom_uni_number_box2)();
}
const _easycom_unicloud_db = () => "../../../node-modules/@dcloudio/uni-components/lib/unicloud-db/unicloud-db.js";
const _easycom_uni_data_checkbox = () => "../../../uni_modules/uni-data-checkbox/components/uni-data-checkbox/uni-data-checkbox.js";
const _easycom_uni_number_box = () => "../../../uni_modules/uni-number-box/components/uni-number-box/uni-number-box.js";
if (!Math) {
  (_easycom_unicloud_db + _easycom_uni_data_checkbox + _easycom_uni_number_box)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.w(({
      data,
      loading,
      error,
      options,
      pagination,
      hasMore
    }, s0, i0) => {
      return common_vendor.e(!$data.getone ? {
        a: common_vendor.t($data.getcount ? pagination.count : "未知"),
        b: common_vendor.t(data.length)
      } : {}, {
        c: loading
      }, loading ? {} : {
        d: "49f96def-1-" + i0 + ",49f96def-0",
        e: common_vendor.p({
          codes: data
        })
      }, {
        f: !hasMore && !loading
      }, !hasMore && !loading ? {} : {}, {
        g: i0,
        h: s0
      });
    }, {
      name: "d",
      path: "a",
      vueId: "49f96def-0"
    }),
    b: !$data.getone,
    c: common_vendor.sr("udb", "49f96def-0"),
    d: common_vendor.p({
      options: $data.options,
      ["page-data"]: $data.pageData,
      collection: $data.collection,
      field: $data.field.join(","),
      ["page-size"]: $data.pageSize,
      orderby: $data.orderby,
      getone: $data.getone,
      ["page-current"]: $data.pageCurrent,
      getcount: $data.getcount
    }),
    e: common_vendor.o((...args) => $options.add && $options.add(...args), "06"),
    f: common_vendor.o((...args) => $options.remove && $options.remove(...args), "44"),
    g: common_vendor.o((...args) => $options.update && $options.update(...args), "cf"),
    h: common_vendor.o((...args) => $options.getFn && $options.getFn(...args), "ae"),
    i: $data.getone,
    j: common_vendor.o(($event) => $data.getone = $event.detail.value, "46"),
    k: !$data.getone
  }, !$data.getone ? common_vendor.e({
    l: common_vendor.o(($event) => $data.pageData = $event, "f8"),
    m: common_vendor.p({
      localdata: $data.pageDataList,
      modelValue: $data.pageData
    }),
    n: $data.pageData == "replace"
  }, $data.pageData == "replace" ? {
    o: common_vendor.o(($event) => $options.changePageCurrent($event / 1), "bd"),
    p: common_vendor.p({
      min: 1,
      value: $data.pageCurrent
    })
  } : {
    q: common_vendor.o(($event) => _ctx.$refs.udb.loadMore(), "a9")
  }, {
    r: common_vendor.o(($event) => $event / 1 > 0 ? $data.pageSize = $event / 1 : "", "90"),
    s: common_vendor.p({
      min: 1,
      value: $data.pageSize
    }),
    t: common_vendor.o($options.setOrderby, "45"),
    v: common_vendor.o(($event) => $data.orderbyArr = $event, "91"),
    w: common_vendor.p({
      multiple: true,
      localdata: $options.mArrJson($data.fields),
      modelValue: $data.orderbyArr
    }),
    x: common_vendor.t($data.orderby),
    y: $data.getcount,
    z: common_vendor.o(($event) => $data.getcount = $event.detail.value, "20")
  }) : {}, {
    A: common_vendor.o(($event) => $data.field = $event, "5c"),
    B: common_vendor.p({
      multiple: true,
      localdata: $options.mArrJson($data.fields),
      modelValue: $data.field
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-49f96def"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/clientDB/unicloud-db-demo/unicloud-db-demo.js.map
