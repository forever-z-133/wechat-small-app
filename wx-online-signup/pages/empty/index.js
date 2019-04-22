// pages/empty/index.js
var app = getApp();

Page({
  onLoad: function (options) {
    options = Object.assign({}, options, options.query);

    // 完成此过程后跳页的重定向
    this.redirect = options.redirect;

    // 如果 index 传来 jump=true 则跳页至 web
    this.fromLogin = options.jump;

    // 其他全局变量的处理
    app.temp.payed = false;
  },
  onShow: function () {
    app.data.lastWebView = null;
    setTimeout(this.jump, 50);
  },
  jump: function () {
    let { redirect = '' } = this;
    redirect = redirect ? '?redirect=' + redirect : '';
    wx.navigateTo({
      url: '/pages/web/index' + redirect,
      complete: () => {
        this.redirect = '';
        this.fromLogin = false;
      }
    });
  },
})