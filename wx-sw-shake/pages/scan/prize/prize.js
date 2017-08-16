// prize.js
var app = new getApp();
var id = '';


Page({
  data: {
    prize: [],
    prize_grey: [],
    no_one: false,
  },
  onLoad: function (options) {

  },
  onShow: function () {
    app.Login((r1) => {
      console.log('入口判断', r1);
      id = r1.Unionid;
      wx.request({ // 查询中奖
        url: 'https://sum.kdcer.com/api/OpenShop/GetBonus',
        data: {
          Unionid: id,
          pageNo: 0,
          pageSize: 5,
        },
        success: (r) => {
          console.log('奖品查看', r.data);
          this.setData({
            prize: r.data.Red,
            prize_grey: r.data.Gray,
            no_one: r.data.Red.length < 1 && r.data.Gray.length < 1
          });
        },
      });
    });
  },
})