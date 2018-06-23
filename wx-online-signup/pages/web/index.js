//index.js
//获取应用实例

import { alert, getValueFromUrl } from '../../utils/util.js';
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
    this.setWebView(web || webUrl);
  },
  onShow: function () {
    setTimeout(() => {
      // 支付是否完成
      if (app.data.payFinish) {
        var str = Object.keys(app.data.payFinish).reduce((re, key) => {
          return re + '&' + key + '=' + app.data.payFinish[key];
        }, '');
        this.setWebView(webUrl + 'paymentTip', str);
        app.data.payFinish = null;
      }
    }, 50)

  },
  // -------- 设置 web-view 链接
  setWebView(url = baseUrl, more = '') {
    var guid = Math.random().toString(36).substring(2, 7);
    url += '?uid=' + app.data.uid;
    url += '&oid=' + app.data.oid;
    url += '&sid=' + app.data.sid;
    if (more) url += more;
    url += '#wechat_redirect';
    url += '?guid=' + guid;
    console.log(url);
    this.setData({ url: url });
  },
  // -------- 分享
  onShareAppMessage: function(options) {
    var web = options.webViewUrl;
    web = web.replace(/(\?|#)[\w\W]*$/, '');
    var url = '/pages/index/index';
    // url += '?redirect=' + web;
    console.log('分享链接', url);
    return {
      title: '选课选课选课',
      path: url,
      imageUrl: '',
    }
  }
})
