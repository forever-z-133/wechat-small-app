// pages/getAuth/index.js

var app = getApp();
import { hasGotAllAuth } from '../../utils/util.js';

Page({
  data: {
    needUserAuth: false,
    needOtherAuth: false,
  },
  onLoad: function (options) {
    var needAuth = options.auth;
    this.data.needAuth = needAuth || 'userInfo';
  },
  onShow: function (options) {
    this.checkTheAuth()
  },
  // --- 判断 needAuth 的功能是否已授权
  checkTheAuth() {
    hasGotAllAuth(this.data.needAuth, (yes, raw) => {
      // 除身份外的其他授权
      var oAuth = Object.keys(raw).filter(key => key != 'scope.userInfo');
      // 其他是否已全部授权
      var needOtherAuth = oAuth.length > 0 && oAuth.some(x => !raw[x]);
      // 进行授权按钮修改
      this.setData({
        needUserAuth: !raw['scope.userInfo'],
        needOtherAuth: needOtherAuth,
      })
      // 全部已授权的回调
      if (!this.data.needOtherAuth && !this.data.needUserAuth) {
        this.finishTheAuth()
      }
    })
  },
  // --- 如果已获得身份授权
  onGetUserInfo(res) {
    if (!/ok/i.test(res.detail.errMsg)) return;

    var userInfo = res.detail;
    this.setData({ needUserAuth: false })
    this.checkTheAuth()
  },
  // --- 是否已获得所有授权
  finishTheAuth() {
    wx.navigateBack()
  }
})