// pages/address/address.js
const app = getApp()
import post from '../ajax.js';
import { money } from '../../utils/util.js';

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
    console.log('临时订单', r);


    this.reload_list(r.DraftOrder.OrderDraftInfos);
  },
  remove: function (e) {
    console.log(e)
  },
  // 更新当前列表数据
  convert_list: function (r) {
    return r.map(x => {
      x.name = x.CommodityName;
      x.price = money(x.Price);
      x.all = money(x.Price * x.BuyNum);
      x.theight = 2;
      x.dheight = 1;
      return x;
    });
  },
  update_list: function (r, callback) {
    let nowList = this._now_list()
    let nowListData = nowList.data;
    nowListData = nowListData.push.apply(nowListData, r);
    this.setData({ list: this.data.list });
    callback && callback(r)
  },
  // 加载更多当前列表
  load_list: function (r, callback) {
    r = this.convert_list(r);
    // r = this._default_data();
    this.update_list(r, callback);
  },
  // 重置当前列表
  reload_list: function (r, callback) {
    let list = this._now_list();
    list.data = [];
    list.state = 'load';
    this.load_list(r, callback);
  },
  _now_list: function () {
    return this.data.list;
  },
  _default_data: function () {
    return new Array(2).fill().map((p, i) => {
      return {
        name: '索引'.repeat(Math.random() * 10 >> 0),
        desc: 'XX 先生 1209381098203',
        theight: 2,
        dheight: 1,
      }
    });
  }
})