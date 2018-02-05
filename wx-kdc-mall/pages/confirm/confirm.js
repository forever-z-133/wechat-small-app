// pages/address/address.js
const app = getApp()
import post from '../ajax.js';
let noListState = true;

Page({
  data: {
    list: {
      data: [],
      state: 'none',
    },
  },
  onLoad: function () {
    wx.setNavigationBarTitle && wx.setNavigationBarTitle({
      title: '确认订单'
    });
  },
  onShow: function () {
    var r = wx.getStorageSync('confirm');



    this.load_list();
  },
  remove: function (e) {
    console.log(e)
  },
  // 更新当前列表数据
  update_list: function (r, callback) {
    let nowList = this._now_list()
    let nowListData = nowList.data;
    nowListData = nowListData.push.apply(nowListData, r);
    if (r.length < 1) nowList.state = 'empty';
    if (noListState) nowList.state = 'none';
    console.log(this.data.list, noListState)
    this.setData({ list: this.data.list });
    callback && callback(r)
  },
  // 加载更多当前列表
  load_list: function (loading = true, callback) {
    loading && wx.showLoading();
    post.list(r => {
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
    return new Array(2).fill().map((p, i) => {
      return {
        name: '索引'.repeat(Math.random() * 10 >> 0),
        desc: 'XX 先生 1209381098203',
        link: '../address-add/address-add?id=' + i,
        theight: 2,
        dheight: 1,
      }
    });
  }
})