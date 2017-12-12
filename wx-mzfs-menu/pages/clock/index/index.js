// pages/clock/index/index.js
var app = getApp();

Page({
  data: {
    footer: 'menus',
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
    this.update_list([{ img: '/img/temp/1.png', }, { img: '/img/temp/2.png', }, { img: '/img/temp/3.png', }, { img: '/img/temp/4.png', }, { img: '/img/temp/5.png', }]);
  },
  // 触底加载
  onPullDownRefresh: function () {
  
  },
  // 下拉刷新
  onReachBottom: function () {
  },
  // 对数据进行高度分析，并分到各 cols 中
  update_list: function (r) {
    var result = this.data.list;
    // console.log(r[0].img);
    var x = r[0].img;
    // wx.downloadFile({
    //   url: x,
    //   success: function(res) {
    //     console.log(res);
    //   }
    // })
    return result;
  },
  // 请求列表数据
  post_list: function(callback) {
    callback && callback();
  },
  // 不断滚动，向下就显示上传，向上就显示菜单
  onPageScroll: function(e) {
    this.lastY = 0;
    var st = e.scrollTop;
    if (st > this.lastY) { // 向下滑
      showFooter('upload');
    } else {
      showFooter('menus');
    }
    this.lastY = st;
  },
  showFooter: function(type) {
    this.setData({ footer: type });
  },
  onShareAppMessage: function () {
  
  }
})