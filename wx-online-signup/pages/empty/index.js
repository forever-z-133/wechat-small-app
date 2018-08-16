// pages/empty/index.js

import { getValueFromUrl } from '../../utils/util.js';
var app = getApp();

var webUrl = app.data.webUrl + '/homepage';

Page({
  data: {
  
  },
  onLoad: function (options) {
    // 完成此过程后跳页的重定向
    this.redirect = getValueFromUrl('redirect', options);

    // 如果 index 传来 jump=true 则跳页至 web
    this.fromLogin = getValueFromUrl('jump', options);
  },
  onShow: function () {
    setTimeout(this.jump, 50);
    app.data.lastWebView = null;
  },
  jump: function () {
    wx.navigateTo({
      url: '/pages/web/index' + '?redirect=' + (this.fromLogin ? this.redirect : webUrl),
      complete: () => {
        this.fromLogin = false;
      }
    });
  },
})