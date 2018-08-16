//index.js
//获取应用实例

import { alert, getValueFromUrl } from '../../utils/util.js';
var app = getApp();

var webUrl = app.data.webUrl + '/';

var tokenTimer = null;

Page({
  data: {
  },
  onmessage: function (res) {
  },
  onLoad: function (options) {
    var web = getValueFromUrl('redirect', options);
    web = decodeURIComponent(web);
    web = decodeURIComponent(web);
    web = web === 'null' ? webUrl : '';
    
    // 支付后的跳转有点复杂...
    // 由于 /web/index 的 web-view 跳到支付完成页后还能返回确定订单页
    // 故选择重载 redirectTo 到 /web/index，清除所有历史访问记录。
    // 先在 onShow 判断是否支付完成，是则重载 /web/index，并带上参数 payed；
    // 重载触发 onLoad，此时判断 payed 是否存在，存在则使 web-view 显示支付结果页。
    this.web = web;
  },
  onShow: function () {
    if (app.data.payed) return this.toPayFinish();
    this.setWebView(this.web || webUrl);
    setTimeout(() => {
      if (app.data.payFinish) {
        app.data.payed = true;
        wx.redirectTo({ url: '/pages/web/index' + '?payed=true' });
      }
    }, 50);
  },
  // -------- 支付成功
  toPayFinish: function () {
    if (app.data.payFinish) {
      var more = Object.keys(app.data.payFinish).reduce((re, key) => {
        return re + '&' + key + '=' + app.data.payFinish[key];
      }, '');
      this.setWebView(webUrl + 'paymentTip', more);
      app.data.payFinish = null;
      app.data.payed = false;
    }
  },
  // -------- 设置 web-view 链接
  setWebView(url = webUrl, more = '') {
    if (app.data.lastWebView === url) return;
    app.data.lastWebView = url;
    var guid = Math.random().toString(36).substring(2, 7);
    url += '?sid=' + app.data.sid;
    url += '&guid=' + guid;
    if (more) url += more;
    url += '#wechat_redirect';
    console.log(url);
    this.setData({ url: url });
  },
  // -------- 分享
  onShareAppMessage: function (options) {
    var webview = options.webViewUrl;
    var json = app.createShareData(webview);
    console.log('转发出去的链接', json.path);
    return json;
  }
})