// pages/mine/index/index.js
var app = getApp();
var defaultImg = app.defaultImg;

Page({
  data: {
    footer: 'menus',
    footerIndex: 2,
    ended: false,
    list: [],
  },
  tabBar: app.footer,
  onShareAppMessage: app.share,
  onPageScroll: function(e) {app.scroll(e, this)},
  onPullDownRefresh: function () {
    this.get_list(true);
  },
  onReachBottom: function () {
    this.get_list();
  },


  // ---------------- 正式开始
  onLoad: function (options) {
    this.get_list();
  },
  get_list: function (fresh, callback) {
    this.post_list(r => {
      this.update_list(r, callback);
    });
  },
  post_list: function (callback) {
    var r = defaultImg
    callback && callback(r);
    // wx.request({
    //   url: '',
    //   success: r => {
    //     console.log('获取列表', r);
    //     callback && callback(r);
    //   }
    // })
  },
  update_list: function (r, callback) {
    this.data.list = this.data.list.concat(r);
    this.setData({
      ended: r.length < 1,
      list: this.data.list,
    })
    callback && callback();
  },
})