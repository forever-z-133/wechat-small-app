//index.js
//获取应用实例

import { alert, getValueFromUrl, getQueryString } from '../../utils/util.js';
var app = getApp();

var webUrl = app.data.webUrl + '/';
// webUrl = 'http://192.168.2.144:3000/';

var tokenTimer = null;

Page({
  data: {
  },
  onmessage: function (res) {
  },
  onLoad: function (options) {
    var web = getValueFromUrl('redirect', options);
    
    // 支付后的跳转有点复杂...
    // 由于 /web/index 的 web-view 跳到支付完成页后还能返回确定订单页，故选择重载 /web/index 清除历史访问记录。
    // 先在 onShow 判断是否支付完成，是则重载 /web/index，并带上参数 payed；
    // 重载触发 onLoad，此时判断 payed 是否存在，存在则使 web-view 显示支付结果页。
    if (options.payed) return this.toPayFinish();
    this.setWebView(web || webUrl);
  },
  onShow: function () {
    setTimeout(() => {
      if (app.data.payFinish) {
        wx.redirectTo({ url: '/pages/web/index' + '?payed=true' });
      }
    }, 50);
  },
  // -------- 支付成功
  toPayFinish: function () {
    if (app.data.payFinish) {
      var str = Object.keys(app.data.payFinish).reduce((re, key) => {
        return re + '&' + key + '=' + app.data.payFinish[key];
      }, '');
      this.setWebView(webUrl + 'paymentTip', str);
      app.data.payFinish = null;
    }
  },
  // -------- 设置 web-view 链接
  setWebView(url = webUrl, more = '') {
    var guid = Math.random().toString(36).substring(2, 7);
    // url += '?uid=' + app.data.uid;
    // url += '&oid=' + app.data.oid;
    // url += '&sid=' + app.data.sid;
    url += '?sid=' + app.data.sid;
    url += '&guid=' + guid;
    if (more) url += more;
    url += '#wechat_redirect';
    console.log(url);
    this.setData({ url: url });
  },
  // -------- 分享
  onShareAppMessage: function(options) {
    var web = options.webViewUrl;
    console.log('转发时的网页链接', web);
    var href = web.replace(/(\?|#)[\w\W]*$/, '');
    var url = '/pages/index/index';
    // 普通分享，未带上
    if (!getQueryString('iid', web)) {
      alert('该转发未带有关键信息，对方无法');
    } else {

    }
    console.log('href', web)
    var url = '/pages/index/index';
    // url += '?redirect=' + web;
    console.log('分享链接', url);
    return {
      title: '一起来报班学习吧！',
      path: url,
      imageUrl: '../../images/share.jpg',
    }
  }
})
