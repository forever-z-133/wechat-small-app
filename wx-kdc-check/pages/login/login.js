var app = getApp()


Page({

  /**
   * 页面的初始数据
   */
  data: {
    can: null,
  },
  onLoad: function (options) {
    
  },
  onShow: function () {
    wx.showLoading({
      title: '身份验证中...',
    })
    // wx.request({
    //   url: '',
    //   data: '',
    //   success: function (r) {
    //     console.log(r)
    //     wx.hideLoading()

    //   },
    //   fail: function(err) {
    //     wx.hideLoading()
    //     wx.showModal({
    //       title: '接口错误',
    //       content: '',
    //     })
    //   }
    // })
    this.showOrNot(true)
    wx.hideLoading()

  },
  showOrNot: function (ifShow) {
    let value = wx.getStorageSync('key')
    if (value) {
      this.setData({ can: ifShow })
    } else {
      wx.setStorageSync('key', true)
      this.switch()
    }
  },
  'switch': function() {
    wx.redirectTo({
      url: '../index/index',
    })
  },
  onPullDownRefresh: function () {
  
  },
  onShareAppMessage: function () {
  
  }
})