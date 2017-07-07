// pages/detail/detail.js
var app = getApp()
Page({
  data: {
    id: '00000001',
    info: {},
    winW: 0,
    area_index: 0,
    maps: [],
    ruleShow: false,
    animData: [],
    swiper_index: [],
  },
  onLoad: function (options) {
    // 地图数据
    this.setData({
      maps: app.getMaps()
    });

    // 进入时为第几个 tab
    if (typeof options.tab !== 'undefined') {
      this.setData({
        area_index: options.tab
      })
    }
  },
  onReady: function () {
    // 获取屏幕宽度
    var res = wx.getSystemInfoSync()
    this.setData({
      winW: res.windowWidth
    })

    // 初始化轮播
    // var area = this.data.maps
    // var len = this.data.maps.length;
    // var result = [];
    // for (var i in area) {
    //   result[i] = i;
    // }
  },
  // 转发
  onShareAppMessage: function () {
    return {
      title: '上海购物节点亮地图',
      path: '/pages/index/index',
    }
  },
  /* 扫码 */
  scan: function () {
    var that = this;
    wx.scanCode({
      onlyFromCamera: true,
      success: function (res) {
        /* 判断码的正误 */
        if (!/^\d{1,2}$/.test(res.result)) {
          wx.showModal({
            title: '提示',
            content: '您扫的码好像不对吧',
          });
          return false;
        }
        var index = parseInt(res.result, 10) - 1;
        var one = that.data.maps[index];
        /* 判断重复扫码 */
        if (one.active) {
          wx.showModal({
            title: '提示',
            content: '此区域您已点亮',
          });
          return false;
        }
        /* 成功点亮 */
        that.light(index);
        that.setData({
          area_index: index,
        });
      }
    });
  },
  /* 点亮 */
  light: function (index) {
    this.data.maps[index].active = true;
    app.setMaps(index);
    this.setData({
      maps: this.data.maps
    })
  },
  /* 显示规则 */
  rule: function () {
    this.setData({
      ruleShow: true,
    });
  },
  ruleHide: function () {
    this.setData({
      ruleShow: false,
    });
  },
  // 上轮播
  areaChange: function (evt) {
    if (!event.detail || !event.detail.current) return;
    this.setData({
      area_index: event.detail.current
    })
  },
  // 下轮播
  swiperStart: function (e) {
    let i = this.data.area_index
    let index = this.data.swiper_index[i] || 0
    this.swiper_start_pos = e.touches[0].pageX
    this.offset = -1 * index * this.data.winW
    this.tapStartTime = e.timeStamp
  },
  swiperMove: function (e) {
    let y = this.swiper_start_pos
    this.yy = e.touches[0].pageX - y
    // if (Math.abs(this.yy) < 5) return
    let yy = this.offset + this.yy
    this.slideAnimation(yy, 0)
  },
  swiperEnd: function (e) {
    let i = this.data.area_index
    let result = this.data.swiper_index
    let index = result[i] || 0
    let max = this.data.maps[i].activity.length - 1

    // 页码更新
    if (this.yy > 80) {
      index = --index
    } else if (this.yy < -80) {
      index = ++index;
    }
    if (index < 0) index = 0
    if (index > max) index = max
    result[i] = index
    this.setData({
      swiper_index: result
    })

    // 归位动画
    this.offset = -1 * index * this.data.winH
    this.slideAnimation(this.offset, 200)
  },
  slideAnimation: function (translate, speed) {
    let i = this.data.area_index
    let result = this.data.animData
    let anim = wx.createAnimation({
      duration: speed,
    });
    anim['translateX'](translate).step();
    result[i] = anim.export()
    this.setData({
      animData: result
    })
  },
})