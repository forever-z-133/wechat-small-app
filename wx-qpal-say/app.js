//app.js

import post from 'pages/ajax.js';

App({
  data: {
    userInfo: null,
    userId: null,
    baseUrl: "https://apimall.kdcer.com/api/",
  },
  onLaunch: function () {

  },
  onShow: function () {
    this.entry();
  },

  // 身份接口，在 page.js 中使用 app.entry_finish 即可
  entry: function (cb) {
    if (this.data.userId) {
      this.entry_finish(this.data)
    } else {
      this.login(code => {
        this.getInfo(res => {
          this.data.userInfo = res.userInfo;
          cb && cb(this.data);
          this._entry_finish(this.data);
        })
      })
    }
  },
  _entry_finish: function (cb) { },
  entry_finish: function (cb) {
    if (this.data.userInfo) {
      cb && cb(this.data)
    } else {
      this._entry_finish = cb
    }
  },

  // code与用户信息接口
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
    if (this.data.userInfo) {
      callbcak && callbcak(this.data.userInfo)
    } else {
      wx.getUserInfo({
        lang: 'zh_CN',
        withCredentials: true,
        complete: res => {
          this.ifGetUser(can => { // 判断是否已授权
            console.log('用户信息', res.userInfo)
            this.data.userInfo = res
            callbcak && callbcak(res)
          })
        }
      })
    }
  },

  // 系统信息
  getWindow: function (callback) {
    if (this.data.window) {
      callback && callback(this.data.window)
    } else {
      wx.getSystemInfo({
        success: res => {
          console.log('设备信息', res)
          this.data.window = res;
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

  // 公共分享
  share: function () {
    return {
      title: '坤鼎家的电商小程序',
      path: '/pages/index/index',
    }
  }
})