//index.js
//获取应用实例
var app = getApp();
var cl = ''

Page({
  data: {
    pic: ''
  },
  onLoad: function (opt) {
    console.log('全局传参', opt);
    cl = opt.cl || '';
  },
  onShow: function (opt) {

    app.Login(function (r) {
      if (!r.OverState) {
        if (r.HourState || r.State) {  // 开幕式
          wx.redirectTo({
            url: '../shake/index/index',
          });
        } else if (r.Pic) { // 7 天倒计时
          this.setData({
            pic: r.Pic,
          });
        } else {  // 7 天以前
          wx.showToast({
            title: '活动未开始',
            duration: 999999,
          });
        }
      } else {   // 玩转购物地
        setTimeout(function () {
          wx.redirectTo({
            url: '../scan/index/index' + (cl ? ('?cl=' + cl) : ''),
          });
        }, 200);
      }
    });
  },
})