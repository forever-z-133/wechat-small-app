// pages/card/card.js
var app = getApp()
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
    coverHide: false,
  },
  onLoad: function (options) {
    var that = this
    app.getUserInfo(function(userInfo){
      console.log(userInfo)
      that.setData({
        info: userInfo
      })
    })
  },
  onReady: function() {
    this.ctx = wx.createCanvasContext('prize');
    this.ctx.setFillStyle('#cccccc');
    this.ctx.fillRect(0, 0, 400, 90);
    // this.ctx.globalCompositeOperation = "destination-out";
    // this.ctx.lineTo(0, 0);
    // this.ctx.moveTo(100, 50);
    // this.ctx.stroke();
    // console.log(this.ctx);
    this.ctx.draw();
  },
  onShareAppMessage: function () {
    return {
      title: '优惠尽在吉买盛',
      path: '/pages/index/index',
    }
  },
  /* 查看我的活动奖励 */
  myPrize: function () {
    wx.showModal({
      title: '提示',
      content: '本活动尚未开始！',
      success: function (res) {
        if (res.confirm) { // 确定
        } else if (res.cancel) { // 取消
        }
      }
    })
  },
  /* 开始刮奖 */
  startPrize: function(){
    this.setData({
      coverHide: true
    })
  },
  /* 刮卡 */
  wipe: function(evt) {

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
  rule: function(){
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