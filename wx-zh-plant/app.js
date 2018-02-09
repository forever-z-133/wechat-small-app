//app.js

import post from 'pages/ajax.js';

App({
  data: {
    userInfo: null,
    userId: null,
    baseUrl: "https://apimall.kdcer.com/api/",
  },

  // 身份接口，在 page.js 中使用 app.entry_finish 即可
  entry: function (cb) {
    this.data.code = null;
    this.login(code => {
      this.data.code = code;
      this.getInfo(res => {
        this.data.userData = res;
        this.data.userInfo = res.userInfo;
        cb && cb(this.data);
        this._entry_finish(this.data);
      })
    })
  },
  _entry_finish: function (cb) { },
  entry_finish: function (cb) {
    if (this.data.code) {
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
      },
      fail: err => {
        wx.showModal({
          title: '系统错误',
          content: JSON.stringify(err),
        })
      }
    })
  },
  getInfo: function (callbcak) {
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
        // var need = ['userInfo', 'record']
        var need = ['userInfo']
        var can = need.reduce((re, p) => {
          return !!settings.authSetting['scope.' + p] && re;
        }, true);
        // var can = settings.authSetting['scope.userInfo']
        this.data.noUser = can
        if (!this.data.noUser) {
          wx.hideLoading();
          this.openSetting();
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
  openSetting: function () {
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
    return false;
  },

  // 公共分享
  share: function () {
    return {
      title: '“多”姿多彩 “肉”情蜜意 情人节来百联中环玩点新花样',
      path: '/pages/index/index',
      imageUrl: 'https://sum.kdcer.com/test/wx-zh-plant-0207/share.png'
    }
  }
})