//index.js
import {
  alert,
  urlAddSearch,
  chooseEnviromentFirst,
  returnNoEmptyObject
} from '../../utils/util.js';
import post from '../../utils/post.js';
const app = getApp();
let webUrl = '';
// wx.setStorageSync('user', { id: '87092', identity: 'student' });
// app.data.user = { id: '87092', identity: 'student' }; // 审核专用

Page({
  data: {
    campusData: undefined,
    url: '',
    show_flag: false,
  },
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
    const { env_now, wx_auth, openId, unionId, user } = app.data;

    if (!this.count || this.count < 2) { this.count = 1 + (this.count || 0); return; }
    if (!returnNoEmptyObject(env_now)) return;
    if (!returnNoEmptyObject(wx_auth)) return;
    if (!openId || !unionId) return alert('系统错误：未能取得所需 UnionId');

    webUrl = chooseEnviromentFirst('webUrl');

    // 支付未完成切过来，保持，成功则跳到订单页
    if (app.temp.payed) {
      app.temp.payed = false;
      this.redirect = webUrl + 'chooseCourse';
    }

    const { id, identity } = user;
    if (!id) return alert('登录人数据丢失');
    app.checkCampusOpen(id, identity).then((oid) => {
      wx.setStorageSync('organizationId', oid);
      this.baseDataIsOK();
    }).catch(campusData => {
      console.log(campusData, 22);
      this.setData({ campusData });
    });
  },
  campusChange({ detail = {} }) {
    const { organizationId } = detail;
    wx.setStorageSync('organizationId', organizationId);
    this.setData({ campusData: null });
    this.baseDataIsOK();
  },
  baseDataIsOK() {
    if (this.redirect) {
      this.setWebView(this.redirect);
      this.redirect = '';
    } else {  // 有临时重新向得先跑重定向
      this.setWebView(webUrl);
    }
  },
  // -------- 设置 web-view 链接
  setWebView(url = webUrl) {
    if (!/^http/i.test(url)) url = webUrl + url;

    const { wx_auth, user } = app.data;
    const { id, identity } = user;
    const { openId } = wx_auth || {};
    const userId = wx.getStorageSync('userId');
    const organizationId = wx.getStorageSync('organizationId');
    var guid = Math.random().toString(36).substring(2, 7);

    if (!id) return alert('未获取到学生/员工 ID！');
    if (!openId) return alert('openId 丢失');

    if (identity === 'student') url = urlAddSearch(url, 'sid=' + id);
    if (identity === 'worker') url = urlAddSearch(url, 'wid=' + id);
    if (organizationId) url = urlAddSearch(url, 'cid=' + organizationId);
    if (userId) url = urlAddSearch(url, 'usid=' + (userId));
    url = urlAddSearch(url, 'oid=' + openId);

    // 同个页面，不刷新
    if (app.data.lastWebView === url) return;
    app.data.lastWebView = url;

    console.log(url);

    url = urlAddSearch(url, 'guid=' + guid);
    url += '#wechat_redirect';

    this.setData({ url });
  },
  // -------- 分享
  onShareAppMessage: function (options) {
    var webview = options.webViewUrl;
    var json = app.createShareData(webview);
    console.log('转发出去的链接', json.path);
    return json;
  },
})