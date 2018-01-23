//app.js
App({
  data: {
    userInfo: null
  },
  onLaunch: function () {
  },
  login: function (callback) {
    wx.login({
      success: res => {
        console.log('登录', res)
        this.data.code = res.code
        callback && callback(res.code);
      }
    })
  },
  getInfo: function (callbcak) {
    wx.getUserInfo({  // 进行授权
      lang: 'zh_CN',
      withCredentials: true,
      complete: res => {
        this.ifGetUser(can => { // 是否授权
          console.log('用户信息', res.userInfo)
          // 可以将 res 发送给后台解码出 unionId
          this.data.userInfo = res.userInfo
          callbcak && callbcak(res)
        })
      }
    })
  },
  getWindow: function (callback) {
    if (this.data.window) {
      callback && callback(this.data.window)
    } else {
      wx.getSystemInfo({
        success: res => {
          console.log('设备信息', res)
          callback && callback(res)
        }
      })
    }
  },
  ifGetUser: function (callback) {
    wx.getSetting ? wx.getSetting({
      success: settings => {
        var can = settings.authSetting['scope.userInfo']
        this.data.noUser = can
        console.log('是否已授权', can)
        if (!this.data.noUser) {
          wx.hideLoading();
          wx.showModal({
            content: '拒绝了授权，是否重新开启',
            confirmText: '前往开启',
            showCancel: false,
            success: res => {
              wx.openSetting({
                success: (res) => { }
              });
            },
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
})