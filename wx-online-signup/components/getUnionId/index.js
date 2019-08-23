// components/getUnionId/index.js

import { getCode, getUserInfo } from '../../utils/util.js';
import post from '../../utils/post.js';
const app = getApp();

Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    visible: Boolean
  },
  data: {
    needAuth: ['userInfo'],
    needUserAuth: false,
    needOtherAuth: false,
    userInfo: undefined,
    wx_auth: undefined
  },
  ready() {
    // 若已有则直接过
    const wx_auth = wx.getStorageSync('wx_auth');
    if (wx_auth) return this.success(wx_auth);

    // 若没有则检查是否授权
    // 已授权：通过接口拿 id
    // 未授权：显示相应按钮
    this.getAuth().then(hasAuth => {
      this.getWxUnionId().then((res) => {
        this.success(res);
      });
    }).catch(noAuth => {
      console.log(noAuth);
      const otherAuth = noAuth.filter(x => x !== 'userInfo');
      this.setData({
        needUserAuth: noAuth.indexOf('userInfo') > -1,
        needOtherAuth: otherAuth.length > 0
      });
    });
  },
  methods: {
    getAuth() {
      return new Promise((resolve, reject) => {
        wx.getSetting ? wx.getSetting({
          success: settings => {
            const auth = settings.authSetting; // 已有权限
            const { needAuth } = this.data;  // 要获得的权限
            const hasAuth = needAuth.filter(item => !!auth['scope.' + item]);
            let noAuth = needAuth.filter(item => !auth['scope.' + item]);
            if (!app.data.env_now) noAuth = ['userInfo'];
            noAuth.length > 0 ? reject(noAuth) : resolve(hasAuth);
          }
        }) : alert('您的小程序版本太低，请更新微信');
      });
    },
    getWxUnionId() {
      return new Promise((resolve, reject) => {
        getCode((code, raw) => {
          post.getUnionIdDirect({ code: code }, res => {
            if (res.unionid || res.unionId) {
              const unionId = res.unionid || res.unionId;
              const openId = res.openid || res.openId;
              resolve({ unionId, openId });
            } else {
              // 当直取拿不到 uid 时，走 wx.getUserInfo 和 post.getUnionId
              getCode((code, raw) => {
                getUserInfo(code, user => {
                  const { iv, encryptedData } = user;
                  post.getUnionId({ js_code: code, iv, encryptedData }, res => {
                    const unionId = res.unionid || res.unionId;
                    const openId = res.openid || res.openId;
                    resolve({ unionId, openId });
                  });
                });
              });
            }
          });
        });
      });
    },
    onGetUserInfo(user) {
      if (!/ok/i.test(user.detail.errMsg)) return;
      const userInfo = user.detail;
      this.setData({ userInfo, needUserAuth: false });
      this.getWxUnionId().then((res) => {
        this.success(res);
      });
    },
    success(wx_auth) {
      if (!wx_auth) return;
      wx.setStorageSync('wx_auth', wx_auth);
      const { unionId, openId } = wx_auth;
      app.data.wx_auth = wx_auth;
      app.data.unionId = unionId;
      app.data.openId = openId;
      this.setData({ wx_auth });
      this.triggerEvent('change', wx_auth);
    },
    fail() { }
  }
})
