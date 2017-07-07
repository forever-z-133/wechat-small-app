// pages/detail/detail.js
Page({
  data: {
    id: '00000001',
    info: {},
    maps: [
      {
        name: '浦东新区',
        active: false
      }, {
        name: '浦东新区',
        active: false
      }, {
        name: '浦东新区',
        active: false
      }, {
        name: '浦东新区',
        active: false
      }, {
        name: '浦东新区',
        active: false
      }, {
        name: '浦东新区',
        active: false
      }, {
        name: '浦东新区',
        active: false
      }, {
        name: '浦东新区',
        active: false
      }, {
        name: '浦东新区',
        active: false
      }, {
        name: '浦东新区',
        active: false
      }
    ],
    ruleShow: false,
  },
  onLoad: function (options) {
  },
  onReady: function () {
  },
  onShareAppMessage: function () {
    return {
      title: '优惠尽在吉买盛',
      path: '/pages/index/index',
    }
  },
  /* 扫码 */
  scan: function () {
    var that = this;
    wx.scanCode({
      onlyFromCamera: true,
      success: function (res) {
        that.light(2);
        console.log(res)
      }
    });
  },
  /* 点亮 */
  light: function (index) {
    this.data.maps[index].active = true;
    console.log(this.data.maps);
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
})