// pages/setting/index.js
Page({
  data: {
   ok: false,
  },
  bindgetuserinfo: function(e) {
    var msg = e.detail.errMsg
    if (msg && /deny/.test(msg)) {
      wx.showModal({
        content: '不授权是无法进行0元秒杀的哟',
        showCancel: false,
      })
      this.setData({ ok: false })
    } else if (msg && /:ok/.test(msg)) {
      wx.reLaunch({
        url: '/pages/index/index',
      })
    }
  },
})