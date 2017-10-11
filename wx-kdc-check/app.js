var code = null
var debug = false
var test = false

App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  globalData: {
    userInfo: null,
    code: null,
    unionId: null,
    debug: debug,
    test: test,
  },
  //----------------- 登录
  login: function (callback) {
    if (this.globalData.code) {
      callback && callback(this.globalData.code);
    } else {
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          this.globalData.code = res.code;
          callback && callback(res.code);
        },
        fail: err => {
          wx.hideLoading()
          wx.showModal({
            title: '系统错误',
            content: '未获取到 code，无法进行身份验证。',
          })
        }
      })
    }
  },
  //----------------- 获取用户信息
  userInfo: function (callback) {
    if (this.globalData.userInfo) {
      callback && callback(res.userInfo)
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        lang: 'zh_CN',
        withCredentials: true,
        success: res => {
          this.globalData.userInfo = res.userInfo
          callback && callback(this.globalData.code);
        }
      })
    }
  }
})