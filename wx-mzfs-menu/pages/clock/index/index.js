// pages/clock/index/index.js
var app = getApp();
var defaultImg = app.defaultImg;
var source = [];
var total = defaultImg.length;
var cols = 2;
var _height = null;  // 存储col的高度

Page({
  data: {
    footer: 'menus',
    footerIndex: 0,
    cols: cols,
    list: null,
    ended: false,
    tempList: null,
  },
  // 转发分享
  onShareAppMessage: app.share,
  // 点击底部菜单
  tabBar: app.footer,
  // 触底加载
  onPullDownRefresh: function () {
    this.get_list(true, () => {
      wx.stopPullDownRefresh()
    });
  },
  // 下拉刷新
  onReachBottom: function () {
    this.get_list();
  },
  // 不断滚动，向下就显示上传，向上就显示菜单
  onPageScroll: function (e) { app.scroll(e, this) },


  // ----------------------- 正式开始
  onLoad: function (options) {
    // app.getWindow();
    app.afterLogin = res => {
      // console.log('xxxx', res)
    }
    this.get_list();
    // this.justifyHeight(defaultImg, 0)
  },
  onReady: function () {
    // this.update_list(defaultImg);
  },



  // ----------------------- 以下为列表操作
  // 获取及更新列表
  get_list: function (refresh, callback) {
    if (refresh) {
      _height = null;
      this.data.list = null;
    }
    this.post_list(r => {
      this.update_list(r, callback)
    });
  },
  // 请求列表数据
  post_list: function (callback) {
    // 获取 col 宽度
    this.getColWidth(width => {
      var r = defaultImg
      setTimeout(() => {
        callback && callback(r);
      }, 500)
      // wx.request({
      //   url: '',
      //   success: r => {
      //     console.log('获取列表', r);
      //     callback && callback(r);
      //   }
      // })
    });
  },
  // 对数据进行高度分析，并分到各 cols 中
  update_list: function (r, callback) {
    // 重置 col 高度和列表数据
    if (!_height || !this.data.list) {
      _height = []; this.data.list = [];
      for (var i=0; i<cols; i++) {
        _height[i] = 0;
        this.data.list[i] = [];
      }
    }
    // 放入了缓存区
    this.setData({ tempList: r });
    var total = r.reduce(x => ++x, 0);
    r.forEach((item, i) => {
      // 获取每个列表项的高度
      this.getHeight(item, i, (height) => {
        // 高度获取完毕，开始计算
        if (--total < 1) {
          this.data.list = this.theNewList(r);
          this.setData({ list: this.data.list });
          callback && callback();
        }
      })
    })
  },
  // 根据后加入的列表，产生新的列表
  theNewList: function (temp) {
    temp.forEach(item => {
      // 选出当前 col 高度最小值
      var min = Math.min.apply(null, _height);
      // 选出当前 col 高度最小值的索引
      min = _height.indexOf(min);
      // 进行赋值
      _height[min] += item.itemHeight;
      this.data.list[min].push(item);
    })
    return this.data.list;
  },
  // 返回单个列表项的高度
  getHeight: function(obj, index, callback) {
    // 获取图片信息
    wx.getImageInfo({
      src: obj.img,
      success: img => {
        // 修改图片尺寸，宽度等于 col 宽，高度自适应
        var ratio = img.width / img.height
        obj.width = img.width = this.colWidth;
        obj.height = img.height = obj.width / ratio;
        // 获取文字高度
        var $dom = wx.createSelectorQuery().select('#text_' + index);
        $dom.boundingClientRect(rect => {
          var height = img.height + rect.height;
          obj.itemHeight = height;
          callback && callback(height);
          // console.log('图片' + index, img.height, rect.height)
        }).exec();
      },
    });
  },
  // 获取 col 宽度
  getColWidth: function (callback) {
    if (this.colWidth != undefined) {
      callback && callback(this.colWidth);
    } else {
      var $dom = wx.createSelectorQuery().select('.list');
      $dom.boundingClientRect(rect => {
        var width = rect.width;
        this.colWidth = width;
        // console.log('col 宽度', width)
        callback && callback(width);
      }).exec();
    }
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
  // 图片全部加载完成
  imgLoaded: function () {

  },
})