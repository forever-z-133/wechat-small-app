//index.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    first: true,
    activity: {
      name: '核销项目名称',
      ok: false,
      prize: '奖品名称奖品名称奖品名称',
      time: '0000.00.00',
      desc: '介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍介绍'
    },
  },
  onLoad: function () {
    app.userInfo(function(res){
      console.log(res)
    })
  },
  //---------------- 调取扫一扫
  scan: function() {
    util.wxScan(url => {
      console.log(url)
      this.getInfo(url, function (r) {
        // 欢迎取消
        if (this.data.first) {
          this.setData({
            first: !this.data.first
          })
        }
      })
    })
  },
  //---------------- 扫码接口
  getInfo: function (url, callback) {
    wx.showLoading({
      title: '信息获取中...',
    })
    wx.request({
      url: '',
      data: '',
      success: r => {
        console.log('扫码', r)
        wx.hideLoading()
        callback && callback(r)
      },
      fail: err => {
        wx.hideLoading()
        wx.showModal({
          title: '系统错误',
          content: '扫码接口出错了',
        })
      }
    })
  },
  //---------------- 核销接口
  check: function (callback) {
    wx.showLoading({
      title: '核销中...',
    })
    wx.request({
      url: '',
      data: '',
      success: r => {
        console.log('核销', r)
        wx.hideLoading()
        callback && callback(r)
      },
      fail: err => {
        wx.hideLoading()
        wx.showModal({
          title: '系统错误',
          content: '核销接口出错了',
        })
      }
    })
  }
})