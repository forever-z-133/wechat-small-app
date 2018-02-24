// pages/address/address.js
const app = getApp()
import post from '../ajax.js';

let noListState = true;
let userId = null;
let orderId = null;

Page({
  data: {
    list: {
      data: [],
      state: 'load',
    },
  },
  onPullDownRefresh: function () {
  },
  onLoad: function (option) {
    wx.setNavigationBarTitle && wx.setNavigationBarTitle({
      title: '管理收货地址'
    });

    this.orderId = option.order;
  },
  onShow: function () {
    app.entry_finish(res => {
      userId = res.userId;
      this.reload_list();
    })
  },
  // 点击item，与订单绑定
  click: function(e) {
    var id = e.detail.id;
    var i = e.detail.index;
    if (!this.orderId) return;
    post.bind_address(this.orderId, id, res => {
      if (!res.State) return wx.showToast({ title: '绑定地址失败' });
      var data = this.getDrafData();
      data.DraftOrder.address = this.data.list.data[i];
      wx.setStorage({
        key: 'confirm',
        data: data,
        success: () => {
          wx.navigateBack();
        }
      })
    })
  },
  // 编辑 
  edit: function(e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../address-add/address-add?id=' + id,
    })
  },
  // 删除
  remove: function(e) {
    var id = e.currentTarget.dataset.id;
    post.remove_address(id, res => {
      res.State && this.reload_list();
    })
  },
  // 修改列表数据结构
  covert_list: function(r) {
    var _type = ['家','学校','公司'];
    return r.map(x => {
      x.id = x.Id;
      x.name = [(x.AutoAddress || x.WxAddress) + x.Address].join(',');
      x.desc = x.ContactorName + '(' + (x.Gender ? "女士" : "先生") + ') ' + x.ContactorPhone;
      x.type = _type[x.AddsType];
      return x;
    })
  },
  // 更新当前列表数据
  update_list: function (r, callback) {
    let list = this._now_list();
    if (r.length < 7) list.state = 'empty';
    list.data = list.data.concat(r || []);
    this.setData({ list: this.data.list });
    callback && callback(r)
  },
  // 加载更多当前列表
  load_list: function (loading = true, callback) {
    loading && wx.showLoading();
    post.address(userId, r => {
      wx.hideLoading();
      wx.stopPullDownRefresh();
      wx.hideNavigationBarLoading();
      // var r = this._default_data();
      if (!r.State) return;
      r = r.AddressList
      wx.setStorageSync('address', r)
      r = this.covert_list(r);
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
      return {
        name: '索引'.repeat(Math.random() * 10 >> 0),
        desc: 'XX 先生 1209381098203',
        link: '../address-add/address-add?id=' + i,
        theight: 2,
        dheight: 1,
      }
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
    callback && callback(r);
    return r;
  },
})