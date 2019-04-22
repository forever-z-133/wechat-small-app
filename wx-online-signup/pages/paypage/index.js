// pages/paypage/index.js

import post from '../../utils/post.js';
import { alert, chooseEnviromentFirst } from '../../utils/util.js';
var app = getApp();

Page({
  data: {
    finish: false,
    pay_state: '正在支付...',
    isSuccess: false,
    price: 0,
    payFinish: null,  // 支付完成后传出去的信息
    isFundPay: false,
    showIntegrationShareTip: false,
    howMuchPeopleNeedToShare: 1,
    shareForHowMuchIntegration: 0,
    showTipsModal: false,
  },
  onLoad: function (options) {
    wx.hideShareMenu();
    this.isPaying = false;
    app.temp.payed = false;

    // 获取 推送 传来的信息，#10404
    var data = options;
    try {
      data = JSON.parse(data.fromFund);
    } catch (err) { data = null; }
    this.data.fromFund = data;
    if (this.data.fromFund) {
      this.setData({ isFundPay: true });
      console.log('推送发起支付', this.data.fromFund);
      return setTimeout(this.startWxPay, 50);
    }

    // 身份丢失
    if (!app.data.openId) {
      wx.hideLoading();
      return alert('身份丢失，请重新登录', () => {
        wx.reLaunch({ url: '/pages/index/index?method=lose' });
      });
    }

    // 获取 H5 传来的信息
    var data = options;
    try {
      data = JSON.parse(data.fromH5);
    } catch (err) { data = null; }
    this.data.fromH5 = data;

    // 显示积分转发提示
    const { showIntegrationShareTip, shareForHowMuchIntegration, institutionName } = data || {};
    if (showIntegrationShareTip) {
      const { integralAmount, amount } = shareForHowMuchIntegration;
      this.setData({
        showIntegrationShareTip: true,
        howMuchPeopleNeedToShare: amount,
        shareForHowMuchIntegration: integralAmount,
        institutionName,
      });
    }

    // 处理支付中却触发到 onShow 的情况
    if (this.isPaying) return;

    // onShow 可能比 onLoad 运行得更快
    setTimeout(() => {
      console.log('H5 发起支付', this.data.fromH5);
      this.startWxPay();
    }, 50);
  },
  onShow: function () {
    setTimeout(function () {
      if (this.isPaying) this.checkTheOrder();
    }, 100);
  },
  // --- 根据订单ID拿到校区ID和总价
  startWxPay: function (callback) {
    wx.showLoading();
    this.setData({ finish: false });

    var data = null;

    if (this.data.fromH5) {
      data = {
        id: this.data.fromH5.orderId,
        token: this.data.fromH5.token,
      };
    }

    if (this.data.fromFund) {
      data = {
        openId: app.data.openId,
        type: 'ONLINE_ORDER',
        totalFee: Math.round(this.data.fromFund.totalFee || 0.01),
        businessId: this.data.fromFund.preFundsChangeHistoryId,
      };
      return this.getWxPayData(data);
    }

    post.getOrderInfo(data, res => {
      this.getWxPayData(res);  // 拿取支付签名
    }, err => {
      setTimeout(() => this.wxPayJump('fail'), 1000);
    });
  },
  // --- 拿取支付签名等信息
  getWxPayData: function (json, callback) {
    var data = null;

    if (this.data.fromH5) {
      this.data.fromH5.totalFee = json.orderAmount;
      this.data.fromH5.campusId = json.campusId;

      // 用电子账户支付的零元合同，直接支付成功
      if (json.orderAmount === 0) {
      	return this.wxPayJump('SUCCESS');
      }

      data = {
        totalFee: Math.round((this.data.fromH5.totalFee || 0.01) * 100),
        campusId: this.data.fromH5.campusId || '',
        openId: app.data.openId,
        token: app.data.token || this.data.fromH5.token,
        businessId: this.data.fromH5.orderId,
        institutionId: json.institutionId,
        type: 'ONLINE_ORDER',
        tradeType: 'JSAPI',
      };
    }

    if (this.data.fromFund) {
      return post.startFundOrderPay(json, res => {
        this.openWxPay(res);  // 开启支付
      }, err => {
        setTimeout(() => this.wxPayJump('fail'), 1000);
      });
    }

    post.getPayKeyValue(data, res => {
      this.openWxPay(res);  // 开启支付
    }, err => {
      if (err.data.resultMessage === '订单已经支付') {
        return this.wxPayJump('SUCCESS');
      }
      setTimeout(() => this.wxPayJump('fail'), 500);
    });
  },
  // --- 调起小程序支付，json 从 post.getPayKeyValue 中去取
  openWxPay: function (json, callback) {
    this.isPaying = true;
    wx.requestPayment({
      appId: json.appId,
      timeStamp: json.timeStamp,
      nonceStr: json.nonceStr,
      package: json.package,
      signType: 'MD5',
      paySign: json.paySign,
      complete: res => {
        console.log('支付签名', res);
        this.isPaying = false;
        this.wxPayFinish(res, callback);
      }
    })
  },
  // --- 支付完成的回调
  wxPayFinish: function (res, callback) {
    if (this.data.fromFund) {
      return this.wxPayJump('fail');
    }
    if (/cancel/.test(res.errMsg)) {
      return this.checkTheOrder();
    } else if (!/ok$/.test(res.errMsg)) {
      wx.showToast({ title: '支付失败', icon: 'none', mask: true });
      setTimeout(() => this.wxPayJump('fail', res), 1000);
    } else {
      callback && callback(res);
      this.wxPaySuccess(res);  // 支付成功
    }
  },
  // --------- 支付成功的回调
  wxPaySuccess: function (res, callback) {
    this.wxPayJump('SUCCESS', res);
  },
  // --------- 核销订单，是否到账
  checkTheOrder: function (callback, times = 0) {
    wx.showLoading();
    var data = {
      orderId: this.data.fromH5.orderId,
      token: this.data.fromH5.token,
    };
    post.checkOrderStatus(data, res => {
      if (res !== 'DEAL') {
        // 如果核销未完成，则 500ms 后再试试，总共 1s 内试 2 次
        if (++times < 2) return setTimeout(() => {
          this.checkTheOrder(callback, times);
        }, 500);
        // 核销已完成，核销失败。
        callback && callback();
        return this.wxPayJump('fail', res);
      }
      // 核销成功
      callback && callback();
      this.wxPaySuccess(res);
    });
  },
  // --------- 支付完成
  wxPayJump: function (type = 'SUCCESS', res) {

    if (this.data.fromFund) {
      return setTimeout(() => {
        this.data.fromFund = null;
        wx.navigateBack();
      }, 200);
    }

    wx.hideLoading();
    if (!this.data.fromH5) this.data.fromH5 = {};

    // 更新结果界面状态
    app.temp.payed = true;
    if (type !== 'SUCCESS') {
      return this.setData({ finish: true, isSuccess: false });
    }
    this.setData({
      finish: true,
      isSuccess: true,
      price: this.data.fromH5.totalFee
    });
  },

  openSharePanel() {
    console.log(this.data.fromH5);
    const { token } = this.data.fromH5;
    let { webViewUrl } = this.data.fromH5;
    webViewUrl = decodeURIComponent(webViewUrl);
    let url = webViewUrl + '&token=' + token;
    url = encodeURIComponent(url);
    wx.navigateTo({
      url: '/pages/share/index?method=share&from=' + url,
    });
  },

  // -------------------- 其他公共
  // 跳页
  backToList: function () {
    var href = chooseEnviromentFirst('webUrl');
    href += 'chooseCourse';
    href = encodeURIComponent(href);
    wx.reLaunch({ url: '/pages/empty/index?jump=true&redirect=' + href });
  },
  // 重新支付
  rePay: function () {
    wx.showLoading();
    this.startWxPay();
  },
  // 打开转介绍获积分介绍
  openTipsModal() {
    this.setData({ showTipsModal: true });
  },
  closeTipsModal() {
    this.setData({ showTipsModal: false });
  }
})