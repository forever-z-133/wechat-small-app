// pages/orders/orders.js// pages/page/page.js
const app = getApp()
import post from '../ajax.js';

Page({
  data: {
    tabs: ["全部", "待付款", "待发货", "待收货", "待评价"],
    tabIndex: 0,
    list: [],
  },
  onLoad: function() {
    this.data.list = new Array(this.data.tabs.length + 1).fill().map(x => []);

    this.load_list();
  },
  onPullDownRefresh: function () {
    this.load_list(true);
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
    console.log(list, tabIndex, nowList)
    r = new Array(6).fill();
    r = r.map((p, i) => {
      return { name: 'xx' + tabIndex + i + (this.count ? ++this.count : 1) }
    });
    nowList = nowList.push.apply(nowList, r);
    this.setData({ list: list });
    callback && callback(r)
  },
  load_list: function (reload = false, callback) {
    if (reload) this.data.list[this.data.tabIndex] = [];
    post.page('xxx', r => {
      wx.stopPullDownRefresh();
      this.update_list(r, callback);
    });
  },
})