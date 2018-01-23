const app = getApp()
import post from '../ajax.js';

// 用户数据
let UnionId = null;
let mainInfo = null;
let userInfo = null;

Page({
  data: {
  },
  onLoad: function () {
    app.getWindow(res => {
      this.setData({
        winW: res.windowWidth,
        winH: res.windowHeight,
      })
    });
  },
  onShow: function () {
    this.main(null, false);
  },
  onPullDownRefresh: function () {
    this.main();
  },
  // 主入口
  main: function (callback, hasToast = true) {
    !hasToast && wx.showLoading({ mask: true });
    wx.setScreenBrightness && wx.setScreenBrightness({
      value: .6,
    });
    app.login(code => {
      app.getInfo(res => {
        mainInfo = res
        userInfo = res.userInfo
        post.entry(code, res, this.main_entry)
        wx.hideLoading();
        wx.stopPullDownRefresh();
        callback && callback();
      })
    })
  },
  // 入口数据处理
  main_entry: function() {

  },
})