const app = getApp()
import post from '../ajax.js';
import { money } from '../../utils/util.js';

Page({
  data: {
    list: {
      data: [],
    },
    chosen: null,
  },
  onPullDownRefresh: function () {
    this.reload_list();
  },
  // onReachBottom: function () {
  //   this.load_list();
  // },
  onLoad: function () {
    // wx.hideTabBar();
    
    this.load_list(false);
  },
  choose: function(e) {
    var i = e.currentTarget.dataset.index;
    var list = this._now_list().data;
    list[i].checked = !list[i].checked;
    var list2 = list.filter(x => x.checked);
    var price = list2.reduce((re, x) => re + x.price, 0);
    var count = list2.length;
    this.setData({ priceAll: money(price), chosen: count, list: this.data.list });
  },
  chooseAll: function () {
    var list = this._now_list().data;
    if (list.length && list.length > this.data.chosen) {
      var price = list.reduce((re, x) => re + x.price, 0);
      var count = list.length;
      list = list.map(x => { x.checked = true; return x });
      this.setData({ priceAll: money(price), chosen: count, list: this.data.list });
    } else {
      list = list.map(x => { x.checked = false; return x });
      this.setData({ priceAll: 0, chosen: 0, list: this.data.list });
    }
  },
  // 更新当前列表数据
  update_list: function (r, callback) {
    let nowList = this._now_list().data;
    nowList = nowList.push.apply(nowList, r);
    this.setData({ list: this.data.list });
    callback && callback(r)
  },
  // 加载更多当前列表
  load_list: function (loading = true, callback) {
    loading && wx.showLoading();
    post.page('首页', r => {
      wx.hideLoading();
      wx.stopPullDownRefresh();
      wx.hideNavigationBarLoading();
      var r = this._default_data();
      this.update_list(r, callback);
    });
  },
  // 重置当前列表
  reload_list: function (callback) {
    let list = this._now_list();
    list.data = [];
    list.state = 'load';
    this.load_list(false, callback);
  },
  _now_list: function () {
    return this.data.list;
  },
  _default_data: function () {
    return new Array(6).fill().map((p, i) => {
      var price = parseFloat((Math.random() * 10).toFixed(2))
      return {
        name: '索引'.repeat(Math.random() * 10 >> 0),
        desc: money(price),
        price: price,
        theight: 2,
        dheight: 1,
        checked: false,
      }
    });
  }
})