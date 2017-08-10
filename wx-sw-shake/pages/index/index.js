//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
  },
  onLoad: function (opt) {
    console.log(opt)
    // var query = opt.xx
    this.shakeIndex = '../shake/index/index';
    this.scanIndex = '../scan/index/index'

    // wx.redirectTo({
    //   url: '../scan/index/index',
    // })
  },
  submit: function (e) {
    var that = this
    var formId = e.detail.formId
    app.Login(function (userInfo) {
      console.log(userInfo)
      console.log(formId)
      wx.showModal({
        title: 'xx',
        content: formId,
      })
    })
    // app.Submit(function(){

    // })
    //调用应用实例的方法获取全局数据
  },
})