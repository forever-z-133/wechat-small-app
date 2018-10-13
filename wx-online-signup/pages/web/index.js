//index.js
//获取应用实例

import { alert, getValueFromUrl, chooseEnviromentFirst } from '../../utils/util.js';
import post from '../../utils/post.js';
var app = getApp();

// var webUrl = app.data.webUrl + '/';
var webUrl = '';

var tokenTimer = null;

Page({
  data: {
  },
  onmessage: function (res) {
  },
  onLoad: function (options) {
    var web = getValueFromUrl('redirect', options);
    web = decodeURIComponent(web);
    web = decodeURIComponent(web);

    webUrl = chooseEnviromentFirst('webUrl');
    webUrl = webUrl ? webUrl + '/' : '';

    web = web === 'null' ? webUrl : '';
    
    // 支付后的跳转有点复杂...
    // 由于 /web/index 的 web-view 跳到支付完成页后还能返回确定订单页
    // 故选择重载 redirectTo 到 /web/index，清除所有历史访问记录。
    // 先在 onShow 判断是否支付完成，是则重载 /web/index，并带上参数 payed；
    // 重载触发 onLoad，此时判断 payed 是否存在，存在则使 web-view 显示支付结果页。
    this.web = web;

    this.cid = wx.getStorageSync('organizationId');
    var student = wx.getStorageSync('student') || {};
    this.cid = student.campusId || this.cid;
  },
  onShow: function () {
    if (app.data.payed) return this.toPayFinish();

    setTimeout(() => {
      if (app.data.payFinish) {
        app.data.payed = true;
        wx.redirectTo({ url: '/pages/web/index' + '?payed=true' });
      }
    }, 50);

    var student = {
      studentId: app.data.sid,
      campusId: this.cid,
    }
    this.checkCampusOpen(student, res => {
      this.setWebView(this.web || webUrl);
    });
  },
  // -------- 支付成功
  toPayFinish: function () {
    if (app.data.payFinish) {
      var more = Object.keys(app.data.payFinish).reduce((re, key) => {
        return re + '&' + key + '=' + app.data.payFinish[key];
      }, '');
      this.setWebView(webUrl + 'paymentTip', more);
      app.data.payFinish = null;
      app.data.payed = false;
    }
  },
  // -------- 设置 web-view 链接
  setWebView(url = webUrl, more = '') {
    var guid = Math.random().toString(36).substring(2, 7);
    url += '?sid=' + app.data.sid;
    if (this.cid) url += '&cid=' + this.cid;
    url += '&guid=' + guid;
    if (more) url += more;
    url += '#wechat_redirect';
    console.log(url);
    if (app.data.lastWebView === url.replace(/&guid=[^&#$]*/, '')) return;
    app.data.lastWebView = url.replace(/&guid=[^&#$]*/, '');
    this.setData({ url: url });
  },
  // -------- 分享
  onShareAppMessage: function (options) {
    var webview = options.webViewUrl;
    var json = app.createShareData(webview);
    if (app.data.usid) json.path += '&usid=' + app.data.usid;
    console.log('转发出去的链接', json.path);
    return json;
  },
  checkCampusOpen(student, callback) {
    // 选择校区返回，则直接进入
    var organizationId = app.data.organizationId;
    var student = app.data.student;
    if (organizationId) {
      app.data.student = null;
      app.data.campusData = null;
      app.data.organizationId = null;
      this.cid = wx.getStorageSync('organizationId');
      callback && callback();
    }

    var cid = wx.getStorageSync('organizationId');
    var data = {
      studentId: app.data.sid,
    }
    // 获取开通了的校区
    post.getWxAppOpenCampus(data, res => {
      var list = res.onlineOrganizationDtos;
      var studentName = res.studentName;
      var organizationId = res.studentOrganizationId;

      if (!list || list.length < 1) {
        return alert('您所在的机构皆未开通在线选课', () => {
          wx.reLaunch({
            url: '/pages/index/index?method=lose',
          });
        });
      }
      
      if (!checkOpen(list)) {
        app.data.student = student;
        app.data.studentName = studentName;
        app.data.campusData = list;
        return wx.navigateTo({
          url: '/pages/chooseCampus/index',
        });
      }
      // 满足条件
      callback && callback(student);
    });
    // 判断本人所在的校区是否开通了选课
    function checkOpen(data) {
      return data.some(campus => campus.organizationId === cid);
    }
  }
})