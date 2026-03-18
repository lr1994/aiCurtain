"use strict";
const common_vendor = require("../../../../common/vendor.js");
const uni_modules_uniUpgradeCenter_js_sdk_validator_opendbAppVersions = require("../../js_sdk/validator/opendb-app-versions.js");
const uni_modules_uniUpgradeCenter_pages_utils = require("../utils.js");
const db = common_vendor._r.database();
const dbCmd = db.command;
const dbOrderBy = "stable_publish desc,create_date desc";
const dbSearchFields = ["name", "title", "stable_publish", "type"];
const pageSize = 20;
const pageCurrent = 1;
function getScreenHeight() {
  return document.documentElement ? document.documentElement.clientHeight : window.innerHeight;
}
function createListQuery(condition = {}) {
  return {
    create_env: dbCmd.neq("uni-stat"),
    ...condition
  };
}
const _sfc_main = {
  data() {
    return {
      backButtonHover: false,
      appVersionListDbName: uni_modules_uniUpgradeCenter_pages_utils.appVersionListDbName,
      currentAppid: "",
      currentAppName: "",
      query: "",
      where: "",
      orderby: dbOrderBy,
      selectedIndexs: [],
      options: {
        pageSize,
        pageCurrent,
        ...uni_modules_uniUpgradeCenter_js_sdk_validator_opendbAppVersions.enumConverter
      },
      imageStyles: {
        width: 64,
        height: 64
      },
      loaded: false,
      containerTop: {},
      appList: [],
      showAppIndex: 0
    };
  },
  async onLoad({
    appid
  }) {
    await this.getAppList();
    if (!this.appList.length)
      return;
    this.loaded = true;
    this.appList.forEach((item, index) => {
      if (item.appid === appid || uni_modules_uniUpgradeCenter_pages_utils.defaultDisplayApp) {
        this.showAppIndex = index;
      }
    });
    this.setAppInfo(this.showAppIndex);
    this.where = createListQuery({
      appid: this.currentAppid
    });
  },
  computed: {
    ...common_vendor.mapState("app", ["appid"]),
    appNameList() {
      return this.appList.map((item) => item.name);
    }
  },
  watch: {
    showAppIndex(val) {
      this.setAppInfo(val);
      this.where = createListQuery({
        appid: this.currentAppid
      });
    }
  },
  onReady() {
    this.containerTop.height = `${getScreenHeight()}px`;
  },
  methods: {
    setAppInfo(index) {
      this.currentAppid = this.appList[index].appid;
      this.currentAppName = this.appList[index].name;
    },
    navigateBack() {
      common_vendor.index.navigateBack();
    },
    getWhere() {
      const query = this.query.trim();
      if (!query) {
        return "";
      }
      const queryRe = new RegExp(query, "i");
      return dbSearchFields.map((name) => queryRe + ".test(" + name + ")").join(" || ");
    },
    search() {
      const newWhere = this.getWhere();
      const isSameWhere = newWhere === this.where;
      this.where = newWhere;
      if (this.where) {
        this.where = `(${this.where}) && `;
      }
      this.where += `${new RegExp(this.currentAppid, "i")}.test(appid)`;
      if (isSameWhere) {
        this.loadData();
      }
    },
    loadData(clear = true) {
      this.$refs.udb.loadData({
        clear
      });
    },
    onPageChanged(e) {
      this.$refs.udb.loadData({
        current: e.current
      });
    },
    navigateTo(url, clear) {
      common_vendor.index.navigateTo({
        url,
        events: {
          refreshData: () => {
            this.loadData(clear);
          }
        }
      });
    },
    // 多选处理
    selectedItems() {
      var dataList = this.$refs.udb.dataList;
      return this.selectedIndexs.map((i) => dataList[i]._id);
    },
    // 批量删除
    delTable() {
      this.$refs.udb.remove(this.selectedItems());
    },
    // 多选
    selectionChange(e) {
      this.selectedIndexs = e.detail.index;
    },
    confirmDelete(id) {
      this.$refs.udb.remove(id);
    },
    publish(e) {
      const platforms = Object.keys(this.options.type_valuetotext);
      common_vendor.index.showActionSheet({
        itemList: Object.values(this.options.type_valuetotext),
        success: async (res) => {
          this.navigateTo(
            `./add?appid=${this.currentAppid}&name=${this.currentAppName}&type=${platforms[res.tapIndex]}`
          );
        }
      });
    },
    async getAppList() {
      try {
        const {
          result
        } = await db.collection(uni_modules_uniUpgradeCenter_pages_utils.appListDbName).get();
        if (result && result.data && result.data.length > 0) {
          this.appList = result.data.filter((item) => item.appid !== this.appid);
        } else {
          this.showModalToAppManager();
        }
      } catch (e) {
        const arr = ["TOKEN_INVALID_TOKEN_EXPIRED", "TOKEN_INVALID_ANONYMOUS_USER"];
        if (arr.indexOf(e.code) === -1)
          this.showModalToAppManager();
      }
    },
    showModalToAppManager() {
      let timer = null;
      let second = 3;
      function jump() {
        common_vendor.index.navigateTo({
          url: "/pages/system/app/list"
        });
        clearInterval(timer);
      }
      timer = setInterval(() => {
        if (--second <= 0) {
          jump();
        }
      }, 1e3);
      common_vendor.index.showModal({
        title: "请先添加应用",
        content: "即将跳转至应用管理……",
        showCancel: false,
        confirmText: "立即跳转",
        success: (res) => jump()
      });
    },
    store_list_key(store_list) {
      const arr = store_list ? store_list.filter((item) => item.enable) : [];
      return arr.length ? arr.sort((a, b) => b.priority - a.priority).map((item) => item.name).join(",") : "-";
    }
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_th2 = common_vendor.resolveComponent("uni-th");
  const _easycom_uni_tr2 = common_vendor.resolveComponent("uni-tr");
  const _easycom_uni_td2 = common_vendor.resolveComponent("uni-td");
  const _easycom_uni_data_picker2 = common_vendor.resolveComponent("uni-data-picker");
  const _easycom_uni_dateformat2 = common_vendor.resolveComponent("uni-dateformat");
  const _easycom_uni_table2 = common_vendor.resolveComponent("uni-table");
  const _easycom_uni_pagination2 = common_vendor.resolveComponent("uni-pagination");
  const _easycom_unicloud_db2 = common_vendor.resolveComponent("unicloud-db");
  (_easycom_uni_icons2 + _easycom_uni_th2 + _easycom_uni_tr2 + _easycom_uni_td2 + _easycom_uni_data_picker2 + _easycom_uni_dateformat2 + _easycom_uni_table2 + _easycom_uni_pagination2 + _easycom_unicloud_db2)();
}
const _easycom_uni_icons = () => "../../../uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_th = () => "../../../uni-table/components/uni-th/uni-th.js";
const _easycom_uni_tr = () => "../../../uni-table/components/uni-tr/uni-tr.js";
const _easycom_uni_td = () => "../../../uni-table/components/uni-td/uni-td.js";
const _easycom_uni_data_picker = () => "../../../uni-data-picker/components/uni-data-picker/uni-data-picker.js";
const _easycom_uni_dateformat = () => "../../../uni-dateformat/components/uni-dateformat/uni-dateformat.js";
const _easycom_uni_table = () => "../../../uni-table/components/uni-table/uni-table.js";
const _easycom_uni_pagination = () => "../../../uni-pagination/components/uni-pagination/uni-pagination.js";
const _easycom_unicloud_db = () => "../../../../node-modules/@dcloudio/uni-components/lib/unicloud-db/unicloud-db.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_th + _easycom_uni_tr + _easycom_uni_td + _easycom_uni_data_picker + _easycom_uni_dateformat + _easycom_uni_table + _easycom_uni_pagination + _easycom_unicloud_db)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.loaded
  }, $data.loaded ? {
    b: common_vendor.t($options.appNameList[$data.showAppIndex]),
    c: common_vendor.p({
      type: "bottom"
    }),
    d: common_vendor.o((e) => $data.showAppIndex = e.detail.value, "ae"),
    e: $data.showAppIndex,
    f: $options.appNameList,
    g: common_vendor.o((...args) => $options.search && $options.search(...args), "47"),
    h: $data.query,
    i: common_vendor.o(($event) => $data.query = $event.detail.value, "bf"),
    j: common_vendor.o((...args) => $options.search && $options.search(...args), "f6"),
    k: common_vendor.o((...args) => $options.publish && $options.publish(...args), "aa"),
    l: !$data.selectedIndexs.length,
    m: common_vendor.o((...args) => $options.delTable && $options.delTable(...args), "32"),
    n: common_vendor.w(({
      data,
      pagination,
      loading,
      error,
      options
    }, s0, i0) => {
      return {
        a: "0cb0298a-4-" + i0 + "," + ("0cb0298a-3-" + i0),
        b: "0cb0298a-5-" + i0 + "," + ("0cb0298a-3-" + i0),
        c: "0cb0298a-6-" + i0 + "," + ("0cb0298a-3-" + i0),
        d: "0cb0298a-7-" + i0 + "," + ("0cb0298a-3-" + i0),
        e: "0cb0298a-8-" + i0 + "," + ("0cb0298a-3-" + i0),
        f: "0cb0298a-9-" + i0 + "," + ("0cb0298a-3-" + i0),
        g: "0cb0298a-10-" + i0 + "," + ("0cb0298a-3-" + i0),
        h: "0cb0298a-11-" + i0 + "," + ("0cb0298a-3-" + i0),
        i: "0cb0298a-3-" + i0 + "," + ("0cb0298a-2-" + i0),
        j: common_vendor.f(data, (item, index, i1) => {
          return {
            a: common_vendor.t(item.appid),
            b: "0cb0298a-13-" + i0 + "-" + i1 + "," + ("0cb0298a-12-" + i0 + "-" + i1),
            c: common_vendor.t(item.title || "-"),
            d: "0cb0298a-14-" + i0 + "-" + i1 + "," + ("0cb0298a-12-" + i0 + "-" + i1),
            e: common_vendor.t(options.type_valuetotext[item.type]),
            f: item.type === "wgt" ? "#f0f9eb" : "#ecf5ff",
            g: item.type === "wgt" ? "#67c23a" : "#409eff",
            h: `1px solid ${item.type === "wgt" ? "#e1f3d8" : "#d9ecff"}`,
            i: "0cb0298a-15-" + i0 + "-" + i1 + "," + ("0cb0298a-12-" + i0 + "-" + i1),
            j: "0cb0298a-17-" + i0 + "-" + i1 + "," + ("0cb0298a-16-" + i0 + "-" + i1),
            k: common_vendor.p({
              localdata: options.platform_valuetotext,
              value: item.platform,
              border: false,
              readonly: true,
              split: ","
            }),
            l: "0cb0298a-16-" + i0 + "-" + i1 + "," + ("0cb0298a-12-" + i0 + "-" + i1),
            m: common_vendor.t(item.version),
            n: "0cb0298a-18-" + i0 + "-" + i1 + "," + ("0cb0298a-12-" + i0 + "-" + i1),
            o: common_vendor.t(item.stable_publish == true ? "已上线" : "已下线"),
            p: "0cb0298a-19-" + i0 + "-" + i1 + "," + ("0cb0298a-12-" + i0 + "-" + i1),
            q: "0cb0298a-21-" + i0 + "-" + i1 + "," + ("0cb0298a-20-" + i0 + "-" + i1),
            r: common_vendor.p({
              format: "yyyy-MM-dd hh:mm:ss",
              date: item.create_date,
              threshold: [0, 0]
            }),
            s: "0cb0298a-20-" + i0 + "-" + i1 + "," + ("0cb0298a-12-" + i0 + "-" + i1),
            t: common_vendor.o(($event) => $options.navigateTo("./detail?id=" + item._id, false), index),
            v: "0cb0298a-22-" + i0 + "-" + i1 + "," + ("0cb0298a-12-" + i0 + "-" + i1),
            w: index,
            x: "0cb0298a-12-" + i0 + "-" + i1 + "," + ("0cb0298a-2-" + i0),
            y: common_vendor.p({
              disabled: item.stable_publish
            })
          };
        }),
        k: "0cb0298a-2-" + i0 + ",0cb0298a-1",
        l: common_vendor.p({
          loading,
          emptyText: error.message || "没有更多数据",
          border: true,
          stripe: true,
          type: "selection"
        }),
        m: "0cb0298a-23-" + i0 + ",0cb0298a-1",
        n: common_vendor.o(($event) => pagination.current = $event, "c4"),
        o: common_vendor.p({
          ["show-icon"]: true,
          ["page-size"]: pagination.size,
          total: pagination.count,
          modelValue: pagination.current
        }),
        p: i0,
        q: s0
      };
    }, {
      name: "d",
      path: "n",
      vueId: "0cb0298a-1"
    }),
    o: common_vendor.p({
      align: "center"
    }),
    p: common_vendor.p({
      align: "center"
    }),
    q: common_vendor.p({
      align: "center"
    }),
    r: common_vendor.p({
      align: "center"
    }),
    s: common_vendor.p({
      align: "center"
    }),
    t: common_vendor.p({
      align: "center"
    }),
    v: common_vendor.p({
      align: "center"
    }),
    w: common_vendor.p({
      align: "center"
    }),
    x: common_vendor.p({
      align: "center"
    }),
    y: common_vendor.p({
      align: "center"
    }),
    z: common_vendor.p({
      align: "center"
    }),
    A: common_vendor.p({
      align: "center"
    }),
    B: common_vendor.p({
      align: "center"
    }),
    C: common_vendor.p({
      align: "center"
    }),
    D: common_vendor.p({
      align: "center"
    }),
    E: common_vendor.p({
      align: "center"
    }),
    F: common_vendor.o($options.selectionChange, "db"),
    G: common_vendor.o($options.onPageChanged, "89"),
    H: common_vendor.sr("udb", "0cb0298a-1"),
    I: common_vendor.p({
      collection: $data.appVersionListDbName,
      field: "appid,contents,platform,type,version,min_uni_version,url,stable_publish,create_date,title,name",
      where: $data.where,
      ["page-data"]: "replace",
      orderby: $data.orderby,
      getcount: true,
      ["page-size"]: $data.options.pageSize,
      ["page-current"]: $data.options.pageCurrent,
      options: $data.options
    })
  } : {
    J: common_vendor.s($data.containerTop)
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-upgrade-center/pages/version/list.js.map
