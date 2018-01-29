// pages/orders/orders.js// pages/page/page.js
const app = getApp()
import post from '../ajax.js';
let listHeight = 0;

Page({
  data: {
    tabs: ["全部", "待付款", "待发货", "待收货", "待评价"],
    tabIndex: 0,
    list: [],
  },
  onLoad: function() {
    this.data.list = new Array(this.data.tabs.length + 1).fill().map(x => []);

    app.getWindow(res => {
      listHeight = res.windowHeight - 50;
      this.setData({ listHeight: res.windowHeight - 50 });
    })

    this.load_list();

    wx.hideTabBar({
      complete: res => console.log(res)
    })
  },
  scroll: function(e) {
    var st = e.detail.scrollTop
    if (st < 1) {  // 安卓机下拉方案，不佳
      this.setData({ listHeight: NaN })
    }
  },
  onPullDownRefresh: function () {
    this.load_list(false, true, () => {
      // this.setData({ listHeight: listHeight })
    });
  },
  onReachBottom: function () {
    this.load_list();
  },
  tabchange: function(e) {
    let i = e.detail.index || 0;
    this.setData({ tabIndex: i });
    var nowList = this.data.list[i]
    if (nowList.length < 1) this.load_list();
  },
  update_list: function (r, callback) {
    let list = this.data.list
    let tabIndex = this.data.tabIndex
    let nowList = list[tabIndex]
    r = new Array(6).fill();
    r = r.map((p, i) => {
      return { name: '索引' + tabIndex + ';单次' + i + ';本列' + ++this.count }
    });
    nowList = nowList.push.apply(nowList, r);
    this.setData({ list: list });
    callback && callback(r)
  },
  load_list: function (loading = true, reload = false, callback) {
    if (reload) this.data.list[this.data.tabIndex] = [];
    this.count = this.count ? this.count : 0;
    if (reload) this.count = 0;
    loading && wx.showLoading();
    post.page('xxx', r => {
      wx.hideLoading();
      wx.stopPullDownRefresh();
      this.update_list(r, callback);
    });
  },
})