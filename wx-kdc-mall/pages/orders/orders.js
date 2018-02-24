// pages/orders/orders.js// pages/page/page.js
const app = getApp()
import post from '../ajax.js';
import { money, formatTime } from '../../utils/util.js';

Page({
  data: {
    tabs: ["全部", "待付款", "待发货", "待收货", "待评价"],
    list: [],
    tabIndex: 0,
  },
  onLoad: function() {
    this.setData({ list: this._default_list() });

    app.entry_finish(r => {
      this.userId = r.userId;
      this.reload_list();
    });
  },
  onReachBottom: function () {
    this.load_list();
  },
  tabchange: function(e) {
    let i = e.detail.index || 0;
    this.setData({ tabIndex: i });
    var list = this.data.list[i];
    if (list.data.length < 1) this.load_list();
  },
  convert_list: function(r) {
    return r.map(x => {
      x.time = formatTime(new Date(x.CreateTime))
      return x;
    });
  },
  update_list: function (r, callback) {
    let list = this._now_list();
    if (r.length < 7) list.state = 'empty';
    list.data = list.data.concat(r || []);
    this.setData({ list: this.data.list });
    callback && callback(r)
  },
  load_list: function (callback, loading = true) {
    loading && wx.showLoading();
    var index = this._now_index();
    var list = this._now_list();
    var typeArr = {0:null, 1:0, 2:1, 3:2, 4:3};
    var type = typeArr[index];
    post.orders(this.userId, type, ++list.page, r => {
      wx.hideLoading();
      wx.stopPullDownRefresh();
      if (!r.State) return wx.showToast({ title: '加载失败' });
      var data = r.OrderList || [];
      data = this.convert_list(data);
      this.update_list(data, callback);
    });
  },
  reload_list: function(callback){
    var list = this._now_list();
    list.data = [];
    list.page = 0;
    list.state = 'load';
    this.load_list(callback);
  },
  _now_index: function () {
    return this.data.tabIndex;
  },
  _now_list: function () {
    return this.data.list[this.data.tabIndex];
  },
  _default_list: function () {
    var default_list = new Array(this.data.tabs.length + 1).fill();
    return default_list.reduce((re) => [{ data: [], page: 0, state: 'load' }].concat(re), []);
  },
  // onShow: function () {
  //   app.getWindow(res => {
  //     listHeight = res.windowHeight - 50;
  //     this.setData({ listHeight: res.windowHeight - 50 });
  //   })
  // },
  // scroll: function(e) {
  //   var st = e.detail.scrollTop
  //   if (st < 1) {  // 安卓机下拉方案，不佳
  //     this.setData({ listHeight: NaN })
  //   }
  // },
  onPullDownRefresh: function () {
    this.reload_list(null, false)
    // this.load_list(false, true, () => {
    //   this.setData({ listHeight: listHeight })
    // });
  },
})