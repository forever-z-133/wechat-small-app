// pages/server/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },
  sumit: function(e) {
    var formId = e.detail.formId;
    console.log(formId);
    this.bind(formId, function(r){
      console.log('xxx');
    });
  },
  bind: function (formId, callback) {
    this.login(code => {
      this.getInfo(res => {
        console.log(code)
        console.log(res.iv)
        console.log(res.encryptedData)
        console.log(JSON.stringify(res.userInfo))
        wx.request({
          url: 'https://sum.kdcer.com/api/OpenShop/CodeToSeckill',
          data: {
            code: code,
            iv: res.iv,
            encryptedData: res.encryptedData,
            userInfo: JSON.stringify(res.userInfo),
          },
          success: r => {
            console.log(r);
            callback && callback(r);
          }
        })
      })
    })
  },
  // 登录
  login: function (callback) {
    wx.login({
      success: res => {
        console.log('登录', res)
        // this.globalData.code = res.code
        callback && callback(res.code);
      }
    })
  },
  getInfo: function (callbcak) {
    wx.getUserInfo({
      lang: 'zh_CN',
      withCredentials: true,
      success: res => {
        console.log('用户信息', res)
        // 可以将 res 发送给后台解码出 unionId
        // this.globalData.userInfo = res.userInfo
        callbcak && callbcak(res)
      }
    })
  },
})