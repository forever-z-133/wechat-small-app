//app.js
import { getCode, getUserInfo, hasGotAllAuth, isPage, apiUrl } from './utils/util.js';
import post from './utils/post.js';

App({
  onLaunch: function (options) {

  },
  data: {
    userInfo: null,
    apiUrl: apiUrl,
    webUrl: 'https://static-uat.xuebangsoft.net',
  },

  /*************************
   * 拿取 UnionId 和 Token
   * 经过 getCode、getUserInfo、post.getUnionId 三个步骤
   */
  getUnionId(callback, reload) {
    // 是否从缓存中取 token
    if (reload) {
      this.data._token = null;
    }

    // if (this.data._token) {
    //   callback && callback(this.data._token)
    // } else {
      this.ifGetUser(yes => {
        getCode((code, raw) => {
          post.getUnionIdDirect({ code: code }, res => {
            if (res.unionid) {
              // getUserInfo(user => {
              //   res = Object.assign({}, user.userInfo, res)
              //   this.data._token = res;
              //   callback && callback(res);
              // });
              this.data._token = res;
              callback && callback(res);
            } else {
              // 当直取拿不到 uid 时，走 wx.getUserInfo 和 post.getUnionId
              getCode((code, raw) => {
                getUserInfo(code, user => {
                  post.getUnionId({
                    js_code: code,
                    iv: user.iv,
                    encryptedData: user.encryptedData,
                  }, res => {
                    this.data._token = res;
                    callback && callback(res);
                  });
                });
              });
            }
          });
        });
      });
    // }
  },

  /*
   * 从 onLoad 中的 options 中取得 key 相应的值
   */
  ifGetUser: function (callback) {
    hasGotAllAuth('userInfo', hasAllAuth => {
      // 本页是否为授权页，是否应该跳页
      var isSettingPage = isPage('pages/getAuth/index');

      // 具体操作
      if (!hasAllAuth) {
        // 未授权，且在非授权页，则跳往授权页
        if (!isSettingPage) {
          return wx.navigateTo({
            url: '/pages/getAuth/index?type=setting',
          });
        }
      } else {
        // 已授权，且在授权页，则返回
        if (isSettingPage) {
          return wx.navigateBack();
        }
        // 执行回调
        callback && callback(hasAllAuth);
      }
    });
  },
})