var app = getApp()
var baseUrl = 'https://sum.kdcer.com/api/XcxVerify/';
var UserId = null;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    can: null,
  },
  onLoad: function (options) {
    
  },
  onShow: function () {
    wx.showLoading({
      title: '身份验证中...',
    });
    var that = this;
    app.login(function (code) { // 登录
      app.userInfo(function (res) { // 身份
        var iv = res.iv;
        var userJson = res.userInfo;
        // userJson = JSON.stringify(userJson);
        var encryptedDataStr = res.encryptedData;
        // console.log(code, iv, userJson, encryptedDataStr);
        wx.request({  // 权限申请接口
          url: baseUrl + 'VerifyEnter',
          method: 'POST',
          data: {
            iv: iv,
            code: code,
            userJson: userJson,
            encryptedDataStr: encryptedDataStr,
          },
          success: function (r) {
            console.log('申请权限', r.data);
            if (typeof r.data == 'string') {
              return wx.showLoading({title: '审核结果有误'});
            }
            that.loaded(r.data);
          },
          fail: function (err) {
            wx.hideLoading()
            wx.showModal({title: '申请权限接口报错'});
          }
        })
      });
    });
  },
  // 请求完成
  loaded: function (r) {
    wx.hideLoading();
    // 显示界面
    this.showOrNot(r.State);
    // 保存 UserId
    UserId= r.UserId;
    wx.setStorageSync('UserId', r.UserId);
    // 报错
    if (r.Msg) {  // 没有权限
      wx.showToast({
        title: r.Msg,
        icon: 'loading',
      });
    }
  },
  showOrNot: function (ifShow) {
    // let value = wx.getStorageSync('key');
    // if (value) {  // 第一次
      this.setData({ can: ifShow })
    // } else if (ifShow) {
    //   wx.setStorageSync('key', true)
    //   this.switch()
    // }
  },
  'switch': function() {
    if (!wx.getStorageSync('UserId')) {
      wx.showModal({
        title: '系统错误',
        content: 'UserId 丢失了，请重新登录',
      }); return;
    }
    // wx.navigateTo({
    //   url: '../index/index',
    // })
    wx.redirectTo({
      url: '../index/index?user=' + UserId,
    })
  },
  onPullDownRefresh: function () {
    this.onShow();
  },
  // onShareAppMessage: function () {
  
  // }
})