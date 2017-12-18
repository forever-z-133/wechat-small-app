// pages/recipe/index/index.js
var app = getApp();
var defaultImg = app.defaultImg;

Page({
  data: {
    footer: 'menus',
    footerIndex: 1,
    list: null,
  },
  // 转发分享
  onShareAppMessage: app.share,
  // 点击底部菜单
  tabBar: app.footer,
  // 触底加载
  onPullDownRefresh: function () {
    this.get_list();
  },
  // 下拉刷新
  onReachBottom: function () {
    this.get_list(true);
  },
  // 不断滚动，向下就显示上传，向上就显示菜单
  onPageScroll: function (e) { app.scroll(e, this) },


  // ---------------- 正式开始
  onLoad: function (options) {
  
  },
  get_list: function (callback, fresh) {
    this.post_list(r => {
      this.update_list(r);
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
  },
})