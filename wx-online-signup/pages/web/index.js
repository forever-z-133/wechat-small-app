//index.js
//获取应用实例

import { alert, getValueFromUrl } from '../../utils/util.js';
var app = getApp();

// var baseUrl = 'http://wxapp-test.xuebangsoft.net/';
// var webUrl = baseUrl + 'contact-with-mp.html';
var webUrl = app.data.webUrl + '/';
// webUrl = 'http://192.168.2.140:3000';

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
    // 定时一小时重取 token
    // clearTimeout(tokenTimer);
    // tokenTimer = setTimeout(() => {
    //   app.data.token = null;
    //   this.onShow();
    // }, 60*60*1e3);

    // // token 是否失效
    // if (app.data.token == undefined) {
    //   return alert('token 失效，请重新登录', () => {
    //     wx.reLaunch({ url: '/pages/index/index?method=lose' });
    //   });
    // }

    // 支付是否完成
    if (app.data.payFinish) {
      var str = Object.keys(app.data.payFinish).reduce((re, key) => {
        return re + '&' + key + '=' + app.data.payFinish[key];
      }, '');
      this.setWebView(webUrl + '/paymentTip', str);
      // setTimeout(() => this.setWebView(webUrl), 1500);
      app.data.payFinish = null;
    }
  },
  // -------- 设置 web-view 链接
  setWebView(url = baseUrl, more = '') {
    var guid = Math.random().toString(36).substring(2, 7);
    // url += '?token=' + app.data.token;
    // url += '&uid=' + app.data.uid;
    url += '?uid=' + app.data.uid;
    url += '&oid=' + app.data.oid;
    url += '&sid=' + app.data.sid;
    // url += '&sid=' + "95866";
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
