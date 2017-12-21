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
  ifGetUser: function (callback) {
    wx.getSetting ? wx.getSetting({
      success: settings => {
        var can = settings.authSetting['scope.userInfo']
        this.globalData.noUser = can
        console.log('是否已授权', can)
        if (!this.globalData.noUser) {
          wx.hideLoading();
          wx.showModal({
            content: '拒绝了授权，是否重新开启',
            confirmText: '前往开启',
            showCancel: false,
            success: res => {
              wx.reLaunch({
                url: '/pages/setting/index',
              });
            }
          });
          return;
        } else {
          callback && callback(true);
        }
      }
    }) : wx.showModal({
      content: '您的小程序版本太低，请更新微信',
      showCancel: false
    });
  },
  getInfo: function (callbcak) {
      wx.getUserInfo({  // 进行授权
        lang: 'zh_CN',
        withCredentials: true,
        complete: res => {
          this.ifGetUser(can => { // 是否授权
            console.log('用户信息', res.userInfo)
            // 可以将 res 发送给后台解码出 unionId
            this.globalData.userInfo = res.userInfo
            callbcak && callbcak(res)
          })
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