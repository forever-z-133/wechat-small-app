//app.js
import { getCode, getUserInfo, hasGotAllAuth, isPage, getShareParams } from './utils/util.js';
import post from './utils/post.js';

App({
  data: {
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

    if (this.data._token) {
      console.log('缓存中身份ID', this.data._token);
      callback && callback(this.data._token)
    } else {
      this.ifGetUser(yes => {
        getCode((code, raw) => {
          post.getUnionIdDirect({ code: code }, res => {
            if (res.unionid) {
              this.data._token = res;
              res.openid = res.openid || res.openId;
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
                    res.openid = res.openid || res.openId;
                    callback && callback(res);
                  });
                });
              });
            }
          });
        });
      });
    }
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

  /*
   * 公用的生成分享数据的接口
   */
  createShareData: function (webview) {
    console.log('获得链接', webview);
    webview = webview.replace('#wechat_redirect', '');
    // 默认转发
    var path = '/pages/index/index';
    var title = '报班学习了解一下！';
    var imageUrl = '../../images/img_chooseCourse.jpg';

    var shareOpt = getShareParams(webview);

    // 未带有分享参数，比如 web-view 未加载完成时
    if (!(shareOpt.token || shareOpt.institutionId)) return { title, path, imageUrl }

    // 如果是详情页，重定向为详情页
    var page = shareOpt.href.match(/\/[^\?$\/]+/g);
    page = page ? page[page.length - 1] : '';
    var redirect = '';
    if (page === '/courseDetail') {
      var temp = shareOpt.href.split(/[\?&#]/);
      temp = temp.filter(x => /courseId|type/i.test(x));
      redirect = temp.join('&');
    }

    // 合并为 path
    var userShareParams = '';
    userShareParams += 'iid=' + shareOpt.institutionId;
    userShareParams += '&cid=' + shareOpt.campusId;
    userShareParams += '&sid=' + shareOpt.referrerId;
    // userShareParams += '&sn=' + shareOpt.referrerName;
    path = '/pages/register/index';
    shareOpt.path = path;
    path += (!!~path.indexOf('?') ? '&' : '?') + userShareParams;
    path += redirect ? '&re=' + encodeURIComponent(redirect) : '';
    shareOpt.redirect = encodeURIComponent(redirect);

    title = '一起来报班学习吧！';
    imageUrl = '../../images/share.jpg';
    return { title, path, imageUrl, raw: shareOpt };
  },
  mergerPath(path, params, filter) {
    params = filter.filter(key => (key in params));
    var temp = Object.keys(params).reduce((re, key) => {
      return re.concat([key + '=' + params[key]]);
    }, []);
    var userShareParams = temp.length < 1 ? '' : temp.join('&');
    path += (!!~path.indexOf('?') ? '&' : '?') + userShareParams;
  },
})