// pages/address/address.js
const app = getApp()
import post from '../ajax.js';
import { money, formatTime } from '../../utils/util.js';

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
    app.entry_finish(res => {
      this.userId = res.userId;
    })
    
    this.main_data = this.getDrafData();
    var r = this.main_data;
    console.log('获取临时订单', r);

    this.drafId = r.Id;

    this.setData({
      time: formatTime(new Date(r.CreateTime)),
      need: money(r.PayAmount),
      id: r.OrderNo,
      all: money(r.Amount),
      transPrice: money(r.Freight),
    })

    this.reload_list(r.OrderDraftInfos);
  },
  cancel: function (e) {
    wx.navigateBack()
  },
  pay_start: function() {
    post.order_confirm(this.userId, this.drafId, json => {
      if (json.State) {
        this.orderId = json.orderId;
        var data = JSON.parse(json.Json);
        post.to_pay(data, this.pay_success);
      }
    })
  },
  pay_success: function () {
    post.pay_ok(this.userId, this.orderId, r => {
      wx.showToast({
        title: '成功下单',
        icon: 'success',
        mask: true,
      });
      wx.redirectTo({
        url: 'pages/order/order',
      });
    });
  },


  getDrafData: function (callback) {
    var r = wx.getStorageSync('confirm');
    if (!r || !r.State) {
      wx.showModal({
        content: '出了些错误，去订单页检查下吧',
        showCancel: false,
        confirmText: '好吧',
        success: () => {
          wx.redirectTo({ url: '../orders/orders' })
        }
      })
    }
    r = r.DraftOrder;
    callback && callback(r);
    return r;
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