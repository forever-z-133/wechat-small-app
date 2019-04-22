//app.js
import { getCode, getUserInfo, hasGotAllAuth, isPage, getShareParams, alert } from './utils/util.js';
import post from './utils/post.js';
import config from './utils/config.js';
import EventBus from './utils/eventBus.js';

App({
  event: new EventBus(),
  needAuth: ['userInfo'],
  data: {
    user: undefined,  // 登录人信息
    auth: undefined,  // 微信授权情况
    enviroment: undefined,  // 选择的环境
    unionId: undefined,
    openId: undefined,
    wxUnionId: undefined, // 微信身份解密信息
    entryData: undefined,  // 扫码时带有的数据
    shareInfoData: undefined,  // 与 entryData 一致
  },
  temp: {}, // 用户跳页情况下临时的数据存储
  onLaunch(options = {}) {
    options = Object.assign({}, options, options.query);
    console.log('扫码入参', options);
    wx.removeStorageSync('organizationId');
  },

  /**
   * 系统初始化
   *******************/
  systemSetup(gulp, options) {
    let once = false;
    return new Promise((resolve, reject) => {
      const result = {};
      let total = gulp.length;

      // 全部数据获取完成
      const finish = () => {
        const { entryData, wxUnionId } = result || {};
        const { unionId, openId } = wxUnionId || {};
        this.data.unionId = unionId;
        this.data.openId = openId;
        this.data.shareInfoData = entryData;
        console.log('扫码入参结果', entryData);
        wx.hideLoading()

        resolve(this.data);
      }

      // 先排序，比如 enviroment 完后才能 unionId
      // gulp = ['wxUnionId', 'xx', 'auth', 'entryData', 'x', 'enviroment'];
      const queue = ['auth', 'enviroment', 'wxUnionId', 'entryData']; // 固定的即定顺序
      queue.reverse().forEach(key => {
        const index = gulp.indexOf(key), item = gulp[index];
        if (!item) return; // 在固定中则加到首位
        gulp.splice(index, 1), gulp.unshift(item);
      });
      
      // 按顺序开始异步请求
      (function loop(index) {
        // 全部完成
        if (index > total - 1) return finish();

        // 已有缓存
        const key = gulp[index];
        if (this.data[key]) {
          result[key] = this.data[key];
          return loop.call(this, ++index);
        }

        // 异步请求，结束时继续递归
        const fnName = 'get' + key.slice(0, 1).toUpperCase() + key.slice(1);
        if (!this[fnName]) return console.error('systemSetup 中没有 fnName 方法');
        wx.showLoading({ mask: true });
        this[fnName](options).then(data => {  // 比如 app.getAuth()
          result[key] = data;
          this.data[key] = data;
          loop.call(this, ++index);
        });
      }.bind(this))(0);
    });
  },
  /**
   * 或者权限环境
   *******************/
  getAuth() {
    return new Promise((resolve, reject) => {
      wx.getSetting ? wx.getSetting({
        success: settings => {
          const auth = settings.authSetting; // 已有权限
          const { needAuth } = this;  // 要获得的权限

          if (needAuth.some(x => !auth['scope.' + x])) {
            // 权限不足
            this.event.on('authReady', res => resolve(auth));
            wx.navigateTo({ url: '/pages/getAuth/index' });
          } else {
            // 权限全有
            return resolve(auth);
          }
        }
      }) : alert('您的小程序版本太低，请更新微信');
    });
  },
  /**
   * 选环境
   *******************/
  getEnviroment() {
    return new Promise((resolve, reject) => {
      var env;
      if (config.isPrd === true) {
        env = config.enviroment.prd;
      } else {
        var appInfo = wx.getAccountInfoSync && wx.getAccountInfoSync();
        var appId = appInfo && appInfo.miniProgram.appId;
        if (appId === config.enviroment.prd.appId) {
          config.isPrd = true;
          env = config.enviroment.prd;
        } else {
          config.isPrd = null;
        }
      }

      // 已有 env 则向下走，否则跳页先选，prd 上以上判断
      if (env) {
        resolve(env);
      } else {
        this.event.on('enviromentReady', (res) => resolve(res) );
        wx.navigateTo({ url: '/pages/chooseEnviroment/index' });
      }
    });
  },
  /**
   * 获得码上内容
   *******************/
  getEntryData(options = {}) {
    return new Promise((resolve, reject) => {
      options = Object.assign({}, options, options.query);
      let { sceneId, scene } = options;
      const { sid, usid, iid, cid, oid, wid, redirect } = options;
      if (sceneId || scene) {
        sceneId = sceneId || scene;
        post.getSceneContent({ sceneId }, res => {
          if (res.redirect) res.redirect = encodeURIComponent(res.redirect);
          this.data.shareInfoData = { ...res, raw: options };
          resolve(this.data.shareInfoData);
        });
      } else if (iid || cid || oid) {
        this.data.shareInfoData = {
          studentId: sid, userId: usid || wid,
          institutionId: iid, organizationId: cid || oid,
          redirect, raw: options
        };
        resolve(this.data.shareInfoData);
      } else {
        resolve(undefined);
      }
    });
  },
  /**
   * 获得 UnionId
   *******************/
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

  /*
   * 判断可用校区的
   * id 学生或员工的 id
   * identity 登录人身份（student/worker）
   */
  checkCampusOpen(id, identity = 'student', callback) {
    // 请求结束
    const _finish = (res = {}) => {
      // 没可选机构，直接登出
      if (res.onlineOrganizationDtos.length < 1) {
        return wx.showModal({
          title: '提示',
          content: '您所在的机构皆未开通在线选课',
          confirmText: '登出',
          success: () => {
            if (identity === 'student') {
              post.logout({ studentId: id }, this.logout);
            } else {
              post.logout({ userId: id }, this.logout);
            }
          }
        });
      }

      const { organizationId: entryOrganizationId } = this.data.entryData || {};
      const oldOrganizationId = wx.getStorageSync('organizationId');
      const oid = oldOrganizationId || entryOrganizationId || res.studentOrganizationId || res.userOrganizationId;
      const temp = res.onlineOrganizationDtos.filter((item) => {
        return oid === item.organizationId;
      });

      // 有可用的校区，存储，并继续运行
      if (temp && temp.length) {
        wx.setStorageSync('organizationId', oid);
        return callback && callback();
      }
      // 当前人或码中的校区皆不可用，则前往选择其他校区
      this.temp.chooseCampusData = { data: res, id, identity };
      return wx.navigateTo({
        url: '/pages/chooseCampus/index',
      });
    }

    // 发起请求
    if (identity === 'student') {
      const params = { studentId: id };
      post.checkStudentCampusOpen(params, _finish);
    } else {
      const params = { userId: id };
      post.checkWorkerCampusOpen(params, _finish);
    }
  },

  /*
   * 公用的生成分享数据的接口
   */
  createShareData: function (webview = '') {
    webview = webview.replace('#wechat_redirect', '');
    // 默认转发
    var path = '/pages/index/index';
    var title = '报班学习了解一下！';
    var imageUrl = '../../images/share.jpg';

    var shareOpt = webview.split(/[?&]/);
    console.log('获得链接', shareOpt);

    // 从网页链接中获取参数
    shareOpt = shareOpt.reduce((re, item, index) => {
      const [key, value = ''] = item.split('=');
      if (index === 0) re['url'] = item;
      else if (key) re[key] = value;
      return re;
    }, {});
    
    const { userId } = this.data.shareInfoData || {};
    if (shareOpt.usid) shareOpt.usid = shareOpt.wid || userId;

    // 如果没有传入 webView 比如注册页，则用 entryData 来填充
    if (webview === '') {
      shareOpt = (this.data.shareInfoData || {}).raw || {};
    }

    // 未带有分享参数，比如 web-view 未加载完成时
    if (!(shareOpt.token || shareOpt.iid)) return { title, path, imageUrl }

    // 如果是详情页，重定向为详情页
    let redirect = '';
    if (/\/courseDetail$/.test(shareOpt.url)) {
      const { url, courseId, type } = shareOpt;
      redirect = url + '?courseId=' + courseId + '&type=' + type;
      shareOpt.redirect = encodeURIComponent(redirect);
    }

    // 拼接新的 path
    shareOpt.path = '/pages/register/index';
    const newUrl = Object.keys(shareOpt).reduce((re, key) => {
      if (['iid', 'sid', 'wid', 'usid', 'cid', 'redirect'].indexOf(key) < 0) return re;
      if (shareOpt[key] == undefined) return re;
      return re.concat(key + '=' + shareOpt[key]);
    }, []);
    path = shareOpt.path + '?' + newUrl.join('&');

    // 转发的返回
    title = '一起来报班学习吧！';
    imageUrl = '../../images/share.jpg';
    return { title, path, imageUrl, raw: shareOpt };
  },

  /*
   * logout 登出
   */
  logout() {
    console.log('登出或丢失身份');
    this.data.user = undefined;
    wx.removeStorageSync('user');
    wx.removeStorageSync('organizationId');
  },
})