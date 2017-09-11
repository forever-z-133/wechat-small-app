// index.js
Page({
  data: {
    pic: ''
  },
  onLoad: function (options) {
  
  },
  onReady: function () {
  
  },
  onShareAppMessage: function () {
    return {
      title: '哦哟！2017上海购物节摇一摇超级福利来哉！',
      path: 'pages/index/index',
    }
  },
  onShow: function () {
    var pic = wx.getStorageSync('pic');
    if (pic) {
      this.setData({
        pic: pic,
      });
    } else {
      wx.showToast({
        title: '活动已结束',
        duration: 9999999,
      })
    }

  },
  onPullDownRefresh: function () {
  
  },
  onReachBottom: function () {
  
  },
  onShareAppMessage: function () {
  
  }
})