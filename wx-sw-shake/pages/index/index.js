//index.js
//获取应用实例
var app = getApp();
var endTime = new Date(2017, 8, 10, 0, 0 ,0);

Page({
  data: {
  },
  onLoad: function (opt) {
    console.log('全局传参', opt)
    
    // wx.setEnableDebug({
    //   enableDebug: true
    // })

    app.Login(function (r) {
      // console.log(r);
      var time = app.convertTime(r.Time);
      var offset = endTime - time;
      console.log('时间', new Date(offset).getDate(), '天');
      if (offset > 0) {
        // if (r.BonusState) {  // 当天已中奖
        //   wx.redirectTo({
        //     url: '../scan/prize/prize',
        //   });
        // }
        if (r.HourState || r.State) {  // 当天开幕式
          wx.redirectTo({
            url: '../shake/index/index',
          });
        } else if (r.Pic) { // 7 天
          wx.redirectTo({
            url: '../before/index',
          });
        } else {  // 7 天以前
          wx.showToast({
            title: '活动未开始',
            duration: 999999,
          });
        }
      } else {   // 玩转购物地
        wx.redirectTo({
          url: '../shake/index/index',
        });
        // wx.redirectTo({
        //   url: '../scan/index/index/',
        // });
      }
    });
  },
})