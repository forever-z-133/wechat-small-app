// pages/paypage/index.js

import post from '../../utils/post.js';
import { alert } from '../../utils/util.js';
var app = getApp();

var isPaying = false;

Page({
  data: {
    pay_state: '正在支付...',
    payFinish: null,  // 支付完成后传出去的信息
  },
  onLoad: function (options) {
    var data = options;
    try {
      data = JSON.parse(data.fromH5);
    } catch (err) { data = null; }
    this.data.fromH5 = data;
  },
  onShow: function () {

    // 身份丢失
    if (!app.data.oid) {
      return alert('身份丢失，请重新登录', () => {
        wx.reLaunch({ url: '/pages/index/index?method=lose' });
      });
    }

    // 处理支付中却触发到 onShow 的情况
    if (isPaying) return;

    // onShow 可能比 onLoad 运行得更快
    setTimeout(() => {
      // 未传入所需信息
      console.log('H5 发起支付', this.data.fromH5);
      // if (!this.data.fromH5) return alert('系统错误：未传入所需支付信息');
      // if (!this.data.fromH5.orderId) return alert('系统错误：未传入所需支付信息 oid');
      // if (!this.data.fromH5.token) return alert('系统错误：未传入所需支付信息 token');

      // 开启支付
      this.startWxPay();
    }, 100)
  },
  // --- 根据订单ID拿到校区ID和总价
  startWxPay: function (callback) {
    app.data.token = this.data.fromH5.token;
    var data = {
      id: this.data.fromH5.orderId,
      token: this.data.fromH5.token,
    };
    post.getOrderInfo(data, res => {
      this.getWxPayData(res);  // 拿取支付签名
    }, err => {
      this.setData({ pay_state: '系统错误：获取订单信息失败！' });
      setTimeout(() => this.wxPayJump('fail'), 1000);
    });
  },
  // --- 拿取支付签名等信息
  getWxPayData: function (json, callback) {
    this.data.fromH5.totalFee = json.orderAmount;
    this.data.fromH5.campusId = json.campusId;
    var data = {
      totalFee: (this.data.fromH5.totalFee || 0.01) * 100,
      campusId: this.data.fromH5.campusId || '',
      openId: app.data.oid,
      token: app.data.token,
      businessId: this.data.fromH5.orderId,
      institutionId: json.institutionId,
    };
    post.getPayKeyValue(data, res => {
      this.openWxPay(res);  // 开启支付
    }, err => {
      this.setData({ pay_state: '系统错误：获取支付签名失败！' });
      setTimeout(() => this.wxPayJump('fail'), 1000);
    });
  },
  // --- 调起小程序支付，json 从 post.getPayKeyValue 中去取
  openWxPay: function (json, callback) {
    isPaying = true;
    wx.requestPayment({
      appId: json.appId,
      timeStamp: json.timeStamp,
      nonceStr: json.nonceStr,
      package: json.package,
      signType: 'MD5',
      paySign: json.paySign,
      complete: res => {
        console.log('支付签名', res);
        wx.hideLoading();
        if (/cancel/.test(res.errMsg)) {
          wx.showToast({ title: '支付取消了', icon: 'none', mask: true });
          setTimeout(() => this.wxPayJump('cancel', res), 1000);
        } else if (!/ok$/.test(res.errMsg)) {
          wx.showToast({ title: '支付失败', icon: 'none', mask: true });
          setTimeout(() => this.wxPayJump('fail', res), 1000);
        } else {
          callback && callback(res);
          this.wxPaySuccess(res);  // 支付成功
        }
      }
    })
  },
  // --- 支付成功的回调
  wxPaySuccess: function(res, callback) {
    this.wxPayJump('SUCCESS', res);
  },
  // --- 支付完成
  wxPayJump: function (type = 'SUCCESS', res) {
    app.data.payFinish = { typeTip: type };
    app.data.payFinish.orderId = this.data.fromH5.orderId;
    // app.data.payFinish.errMsg = '';
    app.data.payFinish.money = type === 'SUCCESS' ? this.data.fromH5.totalFee : 0;
    this.data.fromH5 = null;
    isPaying = false;
    wx.navigateBack();
  },
})