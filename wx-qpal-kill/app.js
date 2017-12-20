//app.js
App({
  onLaunch: function () {
    // 是否已获得用户信息
    // wx.getSetting({
    //   success: settings => {
    //     this.globalData.noUser = settings.authSetting['scope.userInfo']
    //   }
    // })
    // // 登录与授权
    // this.login(code => {
    //   this.getInfo(res => {
    //     // console.log(code)
    //     // console.log(res.encryptedData)
    //     // console.log(res.iv)
    //     // console.log(res.rawData)
    //     // console.log(res.signature)
    //     // console.log(res.userInfo)
    //     if (this.afterLogin) {
    //       this.afterLogin(code, res);
    //     }
    //   })
    // })
  },
  // 登录
  login: function (callback) {
    wx.login({
      success: res => {
        console.log('登录', res)
        this.globalData.code = res.code
        callback && callback(res.code);
      }
    })
  },
  getInfo: function (callbcak) {
    wx.getUserInfo({
      lang: 'zh_CN',
      withCredentials: true,
      success: res => {
        console.log('用户信息', res.userInfo)
        // 可以将 res 发送给后台解码出 unionId
        this.globalData.userInfo = res.userInfo
        callbcak && callbcak(res)
      }
    })
  },
  getWindow: function(callback){
    if (this.globalData.window) {
      callback && callback(this.globalData.window)
    } else {
      wx.getSystemInfo({
        success: res => {
          console.log('设备信息', res)
          callback && callback(res)
        }
      })
    }
  },
  globalData: {
    window: null,
    code: null,
    userInfo: null,
    noUser: false,
  }
})