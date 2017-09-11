//index.js
//获取应用实例
var app = getApp();
var cl = '';

Page({
  data: {
    pic: ''
  },
  onLoad: function (opt) {
    console.log('全局传参', opt);
    cl = opt.cl || opt.q || '';
    cl = decodeURIComponent(cl);
    cl = app.QueryString('cl',cl);
  },
  onShow: function (opt) {
    var that = this;
    app.Login(function (r) {
      console.log(r);
      if (!r.OverState) {
        if (r.HourState || r.State) {  // 开幕式
          wx.redirectTo({
            url: '../shake/index/index',
          });
        } else if (r.Pic) { // 7 天倒计时
          wx.hideLoading();
          that.setData({
            pic: 'http://cdn.kdcer.com/'+ r.Pic,
          });
        } else {  // 7 天以前
          wx.showToast({
            title: r.ErrorMessage == 898 ? '系统错误' : '活动未开始',
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