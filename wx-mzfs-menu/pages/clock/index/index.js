// pages/clock/index/index.js
var app = getApp();
var defaultImg = [
  { img: '/img/temp/1.png', text: '内容内容内容内容内容内容内容内容内容' }, 
  { img: '/img/temp/2.png', text: '内容内容内容内容内容' }, 
  { img: '/img/temp/3.png', text: '内内容内容内容' }, 
  { img: '/img/temp/4.png', text: '内容内内容内容内容内容内容' }, 
  { img: '/img/temp/5.png', text: '内容内容内容内容内容内内容内容内容内容内容内容' },
];
var source = [];
var total = defaultImg.length;
var cols = 2;
var list = [1, 2];
var height = [];  // 存储

Page({
  data: {
    footer: 'menus',
    cols: cols,
    list: list,
    tempList: defaultImg,
  },
  onLoad: function (options) {
    // app.getWindow();
    app.afterLogin = res => {
      // console.log('xxxx', res)
    }
    this.justifyHeight(defaultImg, 0)
  },
  onReady: function () {
    this.update_list(defaultImg);
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
    var x = r[0].img;
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
  // 转发分享
  onShareAppMessage: function () {
    return {}
  },
  imgLoaded: function() {

  },
  justifyHeight: function (imgs, index) {
    var now = imgs[index];
    if (!now) return height;
    wx.getImageInfo({
      src: now.img,
      success: res => {
        console.log(res);
        this.justifyHeight(imgs, ++index);
      }
    })
  },
  // 图片加载
  loadImage: function(e){
    var data = e.target.dataset;
    var detail = e.detail;
    source[data.index] = {};
    var img = source[data.index];
    img.src = data.src;
    img.index = data.index;
    img.width = detail.width;
    img.height = detail.height;
    var all = source.reduce(function(sum){return ++sum}, 0);
    if (all >= total) this.imgLoaded()
  },
})