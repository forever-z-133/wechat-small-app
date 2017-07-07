//logs.js
var app = getApp()
Page({
  data: {
    maps: []
  },
  onLoad: function () {
    // 地图数据
    console.log()
    this.setData({
      maps: app.getMaps()
    });
  },
  onShareAppMessage: function () {
    return {
      title: '上海购物节点亮地图',
      path: '/pages/index/index',
    }
  },
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
      }
    });
  },
  light: function(index) {
    this.data.maps[index].active = true;
    app.setMaps(index);
    this.setData({
      maps: this.data.maps
    })
  },
})