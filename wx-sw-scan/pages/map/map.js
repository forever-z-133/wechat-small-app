//logs.js
Page({
  data: {
    maps: [{
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
    }]
  },
  onLoad: function () {
  },
  onShareAppMessage: function () {
    return {
      title: '优惠尽在吉买盛',
      path: '/pages/index/index',
    }
  },
  scan: function(){
    var that = this;
    wx.scanCode({
      onlyFromCamera: true,
      success: function (res) {
        that.light(2);
        console.log(res)
      }
    });
  },
  light: function(index) {
    this.data.maps[index].active = true;
    console.log(this.data.maps);
    this.setData({
      maps: this.data.maps
    })
  },
})