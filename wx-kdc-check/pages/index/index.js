const app = getApp()
const util = require('../../utils/util.js')
var baseUrl = 'https://sum.kdcer.com/api/XcxVerify/';
var UserId = wx.getStorageSync('UserId');
var EventId, BonusId;

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
  onLoad: function (option) {
    UserId = option.user || UserId;
    if (!UserId) {
      wx.showLoading({title: 'UserId 丢失，请联系工作人员'})
    }
    app.userInfo(function(res){
      console.log(res) // 获取用户信息
    })
  },
  //---------------- 调取扫一扫
  scan: function() {
    util.wxScan((url) => {
      console.log('扫码结果', url);
      // var id = util.QueryString('id', url);
      this.getInfo(url);
    })
  },
  //---------------- 取信息
  getInfo: function (Guid) {
    this.post_getInfo(Guid, (r) => {
      if (!r.State && r.Msg) {
        wx.showModal({
          title: '信息获取失败',
          content: r.Msg || '',
        }); return;
      }
      var bouns = r.Bouns || {};
      EventId = bouns.EventId;
      BonusId = bouns.Id;
      this.setData({
        first: false,
        activity: {
          name: bouns.Events.Name || '核销项目名称',
          ok: r.IsVerify,
          prize: bouns.Name || '奖品名称',
          time: this.timeFilter(bouns.ValidityStartTime) + ' - ' + this.timeFilter(bouns.ValidityEndTime),
          desc: bouns.Desc || '介绍介绍介绍介绍',
        },
      })
    })
  },
  //---------------- 时间转换
  timeFilter: function(datestr) {
    return util.parseDate(util.convertDate(datestr), 'yyyy.mm.dd', true);
  },
  //---------------- 核销操作
  onCheck: function() {
    this.check();
  },
  check: function () {
    this.post_check((r) => {
      if (!r.State && r.Msg) {
        wx.showModal({
          title: '核销失败',
          content: r.Msg || '',
        }); return;
      }
      var bouns = this.data.activity
      bouns.ok = r.State;
      this.setData({ activity: bouns });
    });
  },

  // 以下为接口

  //---------------- 扫码接口
  post_getInfo: function (Guid, callback) {
    wx.showLoading({
      title: '信息获取中...',
    })
    wx.request({
      url: baseUrl + 'ApiScanValid',
      method: 'POST',
      data: {
        UserGuid: UserId,
        ScanGuid: Guid || 8,
      },
      success: r => {
        console.log('扫码', r.data)
        wx.hideLoading()
        callback && callback(r.data)
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
  post_check: function (callback) {
    wx.showLoading({
      title: '核销中...',
    })
    wx.request({
      url: baseUrl + 'ApiValid',
      method: 'POST',
      data: {
        VerifyUserGuid: UserId,
        EventId: EventId,
        BonusId: BonusId,
      },
      success: r => {
        console.log('核销', r.data)
        wx.hideLoading()
        callback && callback(r.data)
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