//app.js
App({
  globalData: {
    userInfo: null
  },
  onLaunch: function () {
    // this.userInfo = this.globalData.userInfo
    // //调用API从本地缓存中获取数据
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)
  },

  Login: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      wx.login({
        success: function (r1) {
          // console.log('login:', r1);
          if (r1.code) {
            wx.getUserInfo({
              withCredentials: true,
              success: function (r2) {
                // console.log('getUserInfo', r2);
                that.globalData.userInfo = r2.userInfo
                var data = {
                  code: r1.code,
                  encryptedData: r2.encryptedData,
                  iv: r2.iv,
                  rawData: r2.rawData,
                  signature: r2.signature
                }
                console.log(data);
                // wx.request({
                //   url: 'https://sum.kdcer.com/onLogin',
                //   data: {
                //     code: r1.code,
                //     encryptedData: r2.encryptedData,
                //     iv: r2.iv,
                //     rawData: r2.rawData,
                //     signature: r2.signature
                //   },
                //   success: function (r3) {
                //     // console.log('/onLogin/', r3)
                    typeof cb == "function" && cb(that.globalData.userInfo)
                //   }
                // })
              }
            })
          } else {
            console.log('获取用户登录态失败！' + r.errMsg)
          }
        }
      });
    }
  },
  Scan: function (cb) {
    var that = this
    wx.scanCode({
      success: function (res) {
        console.log(res)
        if (/ok/.test(res.errMsg)) {
          var url = res.result
          var opt = that.QueryString('sd', url);
          console.log(opt)
          // var path = res.path
          typeof cb == 'function' && cb(res)
        } else if (/cancel/.test(res.errMsg)) {

        } else {
          wx.showToast({
            title: '调取扫一扫功能失败',
          })
        }
      }
    })
  },
  Submit: function (e) {
    var formId = e.detail.formId
    console.log(e, formId)
  },
  QueryString: function(name, str){
    var reg = new RegExp('(^|\\?|&)' + name + '=([^&]*)(&|$)');
    var r = str.match(reg);
    return r != null ? decodeURIComponent(r[2]) : null;
  }
})
