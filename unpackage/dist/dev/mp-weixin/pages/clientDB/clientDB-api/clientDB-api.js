"use strict";
const common_vendor = require("../../../common/vendor.js");
const db = common_vendor._r.database();
const _sfc_main = {
  data() {
    return {
      msg: {
        result: {
          data: ""
        }
      },
      pageCurrent: 1,
      pageSize: 2
    };
  },
  methods: {
    addMoreData2TestDb() {
      common_vendor.index.showLoading({
        mask: false
      });
      let dataList = [];
      for (var i = 0; i < 5; i++) {
        dataList.push({
          "data": Math.ceil(Math.random() * 999)
        });
      }
      db.collection("test").add(dataList).then((res) => {
        this.$refs.alertCode.open(res.result);
        common_vendor.index.hideLoading();
      });
    },
    addData2TestDb() {
      common_vendor.index.showLoading({
        mask: false
      });
      db.collection("test").add({
        data: Date.now()
      }).then((res) => {
        this.$refs.alertCode.open(res.result);
        common_vendor.index.hideLoading();
      });
    },
    updateData2TestDb() {
      common_vendor.index.showLoading({
        mask: false
      });
      let testDb = db.collection("test");
      testDb.get({
        getOne: true
      }).then(({
        result: {
          data
        }
      }) => {
        if (data) {
          testDb.doc(data._id).update({
            data: Date.now()
          }).then((res) => {
            common_vendor.index.__f__("log", "at pages/clientDB/clientDB-api/clientDB-api.vue:154", res);
            this.$refs.alertCode.open(res.result);
            common_vendor.index.hideLoading();
          });
        } else {
          common_vendor.index.showToast({
            title: "test表内没有数据",
            icon: "none"
          });
          common_vendor.index.hideLoading();
        }
      });
    },
    removeData2TestDb() {
      common_vendor.index.showLoading({
        mask: false
      });
      let testDb = db.collection("test");
      testDb.get({
        getOne: true
      }).then(({
        result: {
          data
        }
      }) => {
        if (data) {
          testDb.doc(data._id).remove().then((res) => {
            common_vendor.index.__f__("log", "at pages/clientDB/clientDB-api/clientDB-api.vue:181", res);
            this.$refs.alertCode.open(res.result);
            common_vendor.index.hideLoading();
          });
        } else {
          common_vendor.index.showToast({
            title: "test表内没有数据",
            icon: "none"
          });
          common_vendor.index.hideLoading();
        }
      });
    },
    async removeAllData2TestDb() {
      common_vendor.index.showLoading({
        mask: false
      });
      let testDb = db.collection("test");
      let {
        result: {
          data
        }
      } = await testDb.get();
      common_vendor.index.__f__("log", "at pages/clientDB/clientDB-api/clientDB-api.vue:205", data);
      if (data.length) {
        let {
          result: {
            deleted
          }
        } = await testDb.where('data!="不存在的条件"').remove();
        common_vendor.index.showToast({
          title: "成功删除" + deleted + "条数据！",
          icon: "none"
        });
      } else {
        common_vendor.index.showToast({
          title: "test表内没有数据",
          icon: "none"
        });
        common_vendor.index.hideLoading();
      }
    },
    getData(tableName) {
      common_vendor.index.__f__("log", "at pages/clientDB/clientDB-api/clientDB-api.vue:226", tableName);
      common_vendor.index.showLoading({
        mask: true
      });
      db.collection(tableName).get().then((res) => {
        this.$refs.alertCode.open(res.result);
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/clientDB/clientDB-api/clientDB-api.vue:236", err);
      }).finally((e) => {
        common_vendor.index.hideLoading();
      });
    },
    async getOrderByGetTemp() {
      common_vendor.index.showLoading({ mask: true });
      const orderQuery = db.collection("order").field("book_id,quantity").getTemp();
      const bookQuery = db.collection("book").field("_id,author,title").getTemp();
      const res = await db.collection(orderQuery, bookQuery).field("book_id as books_info,quantity").get();
      common_vendor.index.hideLoading();
      this.$refs.alertCode.open(res.result);
    },
    getOrder() {
      common_vendor.index.showLoading({ mask: true });
      db.collection("order,book").field("book_id{title,author} as books_info,quantity").get().then((res) => {
        this.$refs.alertCode.open(res.result);
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/clientDB/clientDB-api/clientDB-api.vue:262", err);
      }).finally(() => {
        common_vendor.index.hideLoading();
      });
    },
    getOneBook() {
      common_vendor.index.showLoading({
        mask: true
      });
      db.collection("book").get({
        getOne: true
      }).then((res) => {
        this.$refs.alertCode.open(res.result);
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/clientDB/clientDB-api/clientDB-api.vue:279", err);
      }).finally(() => {
        common_vendor.index.hideLoading();
      });
    },
    getBookTitle() {
      common_vendor.index.showLoading({
        mask: true
      });
      db.collection("book").field("title").get().then((res) => {
        this.$refs.alertCode.open(res.result);
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/clientDB/clientDB-api/clientDB-api.vue:295", err);
      }).finally(() => {
        common_vendor.index.hideLoading();
      });
    },
    getBookAs() {
      common_vendor.index.showLoading({
        mask: true
      });
      db.collection("book").field("title,author as book_author").get().then((res) => {
        this.$refs.alertCode.open(res.result);
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/clientDB/clientDB-api/clientDB-api.vue:311", err);
      }).finally(() => {
        common_vendor.index.hideLoading();
      });
    },
    getOrderOrderBy(str) {
      common_vendor.index.showLoading({
        mask: true
      });
      db.collection("order").orderBy(str).get().then((res) => {
        this.$refs.alertCode.open(res.result);
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/clientDB/clientDB-api/clientDB-api.vue:326", err);
      }).finally(() => {
        common_vendor.index.hideLoading();
      });
    },
    getBookHasCount() {
      common_vendor.index.showLoading({
        mask: true
      });
      db.collection("book").get({
        "getCount": true
      }).then((res) => {
        this.$refs.alertCode.open(res.result);
      }).catch((err) => {
        common_vendor.index.__f__("error", "at pages/clientDB/clientDB-api/clientDB-api.vue:342", err);
      }).finally(() => {
        common_vendor.index.hideLoading();
      });
    },
    getTreeFn() {
      common_vendor.index.showLoading({
        mask: true
      });
      db.collection("opendb-department").get({
        getTree: {
          limitLevel: 10
          // 最大查询层级（不包含当前层级），可以省略默认10级，最大15，最小1
          //	startWith: "parent_code==''"  // 第一层级条件，此初始条件可以省略，不传startWith时默认从最顶级开始查询
        }
      }).then((res) => {
        common_vendor.index.__f__("log", "at pages/clientDB/clientDB-api/clientDB-api.vue:358", "res: ", res);
        const resdata = res.result.data;
        this.$refs.alertCode.open(resdata);
      }).catch((err) => {
        common_vendor.index.showModal({
          content: err.message || "请求服务失败",
          showCancel: false
        });
      }).finally(() => {
        common_vendor.index.hideLoading();
      });
    },
    async getPageData() {
      common_vendor.index.showLoading({
        mask: false
      });
      let res = await db.collection("book").skip((this.pageCurrent - 1) * this.pageSize).limit(this.pageSize).get();
      common_vendor.index.__f__("log", "at pages/clientDB/clientDB-api/clientDB-api.vue:378", res);
      this.$refs.alertCode.open(res.result.data);
      common_vendor.index.hideLoading();
    }
  }
};
if (!Array) {
  const _easycom_alertCode2 = common_vendor.resolveComponent("alertCode");
  const _easycom_uni_section2 = common_vendor.resolveComponent("uni-section");
  const _easycom_uni_number_box2 = common_vendor.resolveComponent("uni-number-box");
  (_easycom_alertCode2 + _easycom_uni_section2 + _easycom_uni_number_box2)();
}
const _easycom_alertCode = () => "../../../components/alertCode/alertCode.js";
const _easycom_uni_section = () => "../../../components/uni-section/uni-section.js";
const _easycom_uni_number_box = () => "../../../uni_modules/uni-number-box/components/uni-number-box/uni-number-box.js";
if (!Math) {
  (_easycom_alertCode + _easycom_uni_section + _easycom_uni_number_box)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.sr("alertCode", "1319094f-0"),
    b: common_vendor.p({
      title: "简单查询",
      subTitle: "在符合schema设置的前提下,直接在前端查询云端数据库的数据",
      type: "line"
    }),
    c: common_vendor.o(($event) => $options.getData("book"), "3f"),
    d: common_vendor.o(($event) => $options.getData("order"), "ca"),
    e: common_vendor.p({
      title: "查询列表分页",
      subTitle: "设置每页查询数量和页码查询",
      type: "line"
    }),
    f: common_vendor.o(($event) => $data.pageCurrent = $event / 1, "2c"),
    g: common_vendor.p({
      min: 1,
      value: $data.pageCurrent
    }),
    h: common_vendor.o(($event) => $data.pageSize = $event / 1, "41"),
    i: common_vendor.p({
      min: 1,
      value: $data.pageSize
    }),
    j: common_vendor.o(($event) => $options.getPageData("order"), "b9"),
    k: common_vendor.p({
      title: "联表查询-订单和图书",
      subTitle: "只需在db schema中，将两个表的关联字段建立映射关系，即可实现联表查询。",
      type: "line"
    }),
    l: common_vendor.o((...args) => $options.getOrderByGetTemp && $options.getOrderByGetTemp(...args), "ad"),
    m: common_vendor.o((...args) => $options.getOrder && $options.getOrder(...args), "d9"),
    n: common_vendor.p({
      title: "getOne",
      subTitle: "使用clientDB时可以在get方法内传入getOne:true来返回一条数据",
      type: "line"
    }),
    o: common_vendor.o((...args) => $options.getOneBook && $options.getOneBook(...args), "b9"),
    p: common_vendor.p({
      title: "getCount",
      subTitle: "使用clientDB时可以在get方法内传入getCount:true来同时返回总数",
      type: "line"
    }),
    q: common_vendor.o((...args) => $options.getBookHasCount && $options.getBookHasCount(...args), "d1"),
    r: common_vendor.p({
      title: "field",
      subTitle: "查询时可以使用field方法指定返回字段，在<uni-clientDB>组件中也支持field属性。不使用field方法时会返回所有字段",
      type: "line"
    }),
    s: common_vendor.o((...args) => $options.getBookTitle && $options.getBookTitle(...args), "76"),
    t: common_vendor.p({
      title: "name as cname",
      subTitle: "如：author as book_author，意思是将数据库的author字段重命名为book_author",
      type: "line"
    }),
    v: common_vendor.o((...args) => $options.getBookAs && $options.getBookAs(...args), "85"),
    w: common_vendor.p({
      title: "orderBy",
      subTitle: "orderBy方法内可以传入一个字符串来指定排序规则。如:订单表order根据quantity销量字段排序",
      type: "line"
    }),
    x: common_vendor.o(($event) => $options.getOrderOrderBy("quantity asc"), "58"),
    y: common_vendor.o(($event) => $options.getOrderOrderBy("create_date desc"), "e2"),
    z: common_vendor.o(($event) => $options.getOrderOrderBy("quantity asc, create_date desc"), "34"),
    A: common_vendor.p({
      title: "查询树形数据",
      subTitle: "树形数据，在数据库里一般不会按照tree的层次来存储，因为按tree结构通过json对象的方式存储不同层级的数据，不利于对tree上的某个节点单独做增删改查。一般存储树形数据，tree上的每个节点都是一条单独的数据表记录，然后通过类似parent_id来表达父子关系。如部门的数据表，里面有2条数据，一条数据记录是“总部”，parent_id为空；另一条数据记录“一级部门A”，parent_id为总部的_id",
      type: "line"
    }),
    B: common_vendor.o((...args) => $options.getTreeFn && $options.getTreeFn(...args), "41"),
    C: common_vendor.p({
      title: "新增数据记录add",
      subTitle: "获取到db的表对象后，通过add方法新增数据记录",
      type: "line"
    }),
    D: common_vendor.o(($event) => $options.addData2TestDb(), "4e"),
    E: common_vendor.o(($event) => $options.addMoreData2TestDb(), "15"),
    F: common_vendor.p({
      title: "更新数据记录update",
      subTitle: "collection.doc().update(Object data)",
      type: "line"
    }),
    G: common_vendor.o(($event) => $options.updateData2TestDb(), "b2"),
    H: common_vendor.p({
      title: "删除数据记录remove",
      subTitle: "获取到db的表对象，然后指定要删除的记录，通过remove方法删除。",
      type: "line"
    }),
    I: common_vendor.o(($event) => $options.removeData2TestDb(), "ac"),
    J: common_vendor.o(($event) => $options.removeAllData2TestDb(), "a7")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/clientDB/clientDB-api/clientDB-api.js.map
