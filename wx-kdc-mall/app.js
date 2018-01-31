//app.js
App({
  data: {
    userInfo: null,
    userId: null,
    baseUrl: "https://ApiMall.kdcer.com/api/",
  },
  onLaunch: function () {
    if (this.data.userId) {

    } else {
      this.login(code => {
        this.getInfo(res => {
          // post.entry(code, res, this.main_entry)
        })
      })
    }
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
  // 请求用户授权获得信息
  getInfo: function (callbcak) {
    if (this.data.userInfo) {
      callbcak && callbcak(this.data.userInfo)
    } else {
      wx.getUserInfo({
        lang: 'zh_CN',
        withCredentials: true,
        complete: res => {
          this.ifGetUser(can => { // 判断是否已授权
            console.log('用户信息', res.userInfo)
            this.data.userInfo = res.userInfo
            callbcak && callbcak(this.data.userInfo)
          })
        }
      })
    }
  },
  getWindow: function (callback) {
    if (this.data.window) {
      callback && callback(this.data.window)
    } else {
      wx.getSystemInfo({
        success: res => {
          console.log('设备信息', res)
          this.data.winW = res.windowWidth;
          this.data.winH = res.windowHeight;
          callback && callback(res)
        }
      })
    }
  },
  // 检测用户是否拒绝了授权
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
  systemError: function(r) {
    if (typeof r == 'string') {
      wx.showModal({
        content: '系统出错了',
        showCancel: '好吧',
      });
      return true;
    } else return false;
  },
  share: function() {
    return {
      title: '坤鼎家的电商小程序',
      path: '/pages/index/index',
    }
  }
})