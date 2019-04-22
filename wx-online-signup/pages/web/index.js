//index.js
//获取应用实例

import { alert, urlAddSearch, chooseEnviromentFirst } from '../../utils/util.js';
import post from '../../utils/post.js';
var app = getApp();
// app.data.user = { id: '87092', identity: 'student' };

var webUrl = '';

Page({
  onUnload: function() {
    app.data.lastWebView = null;
  },
  onLoad: function (options) {
    options = Object.assign({}, options, options.query);
    this.options = options;
    if (options.redirect) {
      this.redirect = decodeURIComponent(options.redirect);
    }
  },
  onShow: function () {
    if (this.nowFirstLoad && !this.systemReady) return;
    this.nowFirstLoad = true;
    wx.showLoading({ mask: true });

    const gulp = ['wxUnionId', 'auth', 'enviroment'];
    app.systemSetup(gulp).then(res => {
      this.systemReady = true;
      webUrl = chooseEnviromentFirst('webUrl');
      app.data.user = app.data.user || wx.getStorageSync('user');

      // 支付未完成切过来，保持，成功则跳到订单页
      if (app.temp.payed) {
        app.temp.payed = false;
        this.redirect = webUrl + 'chooseCourse';
      }

      const { id, identity } = app.data.user;
      app.checkCampusOpen(id, identity, res => {
        if (this.redirect) {
          this.setWebView(this.redirect);
          this.redirect = '';
        } else {  // 有临时重新向得先跑重定向
          this.setWebView(webUrl);
        }
      });
    });
  },
  // -------- 设置 web-view 链接
  setWebView(url = webUrl) {
    wx.hideLoading();
    const { id, identity } = app.data.user;
    const organizationId = wx.getStorageSync('organizationId');
    var guid = Math.random().toString(36).substring(2, 7);
    if (!id) return alert('未获取到学生/员工 ID！');
    if (identity === 'student') { // 学员
      url = urlAddSearch(url, 'sid=' + id);
    } else {  // 员工
      url = urlAddSearch(url, 'wid=' + id);
    }
    if (organizationId) {
      url = urlAddSearch(url, 'cid=' + organizationId);
    }
    url = urlAddSearch(url, 'oid=' + app.data.openId);

    const { usid, userId } = app.data.entryData || {};
    if (usid || userId) url = urlAddSearch(url, 'usid=' + (usid || userId));

    console.log(url);

    // 同个页面，不刷新
    if (app.data.lastWebView === url) return;
    app.data.lastWebView = url;

    url = urlAddSearch(url, 'guid=' + guid);
    url += '#wechat_redirect';

    this.setData({ url: url });
  },
  // -------- 分享
  onShareAppMessage: function (options) {
    var webview = options.webViewUrl;
    var json = app.createShareData(webview);
    console.log('转发出去的链接', json.path);
    return json;
  },
  checkStudentCampusOpen(student, callback) {
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
    post.checkStudentCampusOpen(data, res => {
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