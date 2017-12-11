// pages/clock/index/index.js
var app = getApp();

Page({
  data: {
    cols: 2,
    list: [1,2],
    height: [],
  },
  onLoad: function (options) {
    // app.getWindow();
    app.afterLogin = res => {
      // console.log('xxxx', res)
    }
  },
  onReady: function () {
  
  },
  onShow: function () {
  
  },
  onHide: function () {
  
  },
  onUnload: function () {
  
  },
  onPullDownRefresh: function () {
  
  },
  onReachBottom: function () {
  
  },
  onPageScroll: function(e) {
    // console.log(e.scrollTop);
  },
  onShareAppMessage: function () {
  
  }
})