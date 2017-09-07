// prize.js
var app = new getApp();
var baseUrl = 'https://sum.kdcer.com/test/img/scan/';
var id = '';


Page({
  data: {
    prize: [],
    baseUrl: baseUrl,
    prize_grey: [],
    no_one: false,
    detail: null,
  },
  onLoad: function (options) {
    // console.log('xxxxx')
  },
  onShow: function () {
    this.pageNo = 0;
    this.setData({
      prize: [],
      prize_grey: [],
      no_one: false,
      empty: false,
    });
    wx.showLoading({
      title: '数据加载中...',
    })
    app.Login((r1) => {
      console.log('入口判断', r1);
      id = r1.Unionid;
      this.load();
    });
  },
  scroll: function(e){
    // console.log(e);
  },
  load: function () {
    if (this.data.empty) return;
    // console.log('x')
    wx.request({ // 查询中奖
      url: 'https://sum.kdcer.com/api/OpenShop/GetBonus',
      data: {
        Unionid: id,
        pageNo: ++this.pageNo,
        pageSize: 8,
      },
      success: (r) => {
        console.log('奖品查看', r.data);
        wx.hideLoading();
        var length = this.data.prize.length + r.data.Red.length + this.data.prize_grey.length + r.data.Gray.length;
        var isEmpty = (r.data.Red.length + r.data.Gray.length) < 1;
        this.setData({
          prize: this.data.prize.concat(r.data.Red),
          prize_grey: this.data.prize_grey.concat(r.data.Gray),
          no_one: length < 1,
          empty: isEmpty,
        });
        this.load();
      },
      error: function (err) {
        wx.hideLoading();
        wx.showModal({
          content: '系统出错咯，待会再来刷新下吧',
        });
      }
    });
  },
  detail: function(e) {
    var i = e.target.dataset.index;
    var d = this.data.prize[i];
    console.log(d);
    this.setData({
      detail: d,
    });
  },
  result_ok: function() {
    this.setData({
      detail: null,
    })
  },
})