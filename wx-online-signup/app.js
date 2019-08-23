//app.js
import { getCode, getUserInfo, isPage, getShareParams, alert, returnNoEmptyObject } from './utils/util.js';
import post from './utils/post.js';
import config from './utils/config.js';
import EventBus from './utils/eventBus.js';

App({
  event: new EventBus(),
  needAuth: ['userInfo'],
  data: {
    user: undefined,  // 登录人信息
    env_now: undefined,
    unionId: undefined,
    openId: undefined,
    wx_auth: undefined,
    entryData: undefined,  // 扫码时带有的数据
  },
  temp: {}, // 用户跳页情况下临时的数据存储
  onLaunch(options = {}) {
    options = Object.assign({}, options, options.query);
    console.log('扫码入参', options);
  },
  
  /**
   * 获得码上内容
   *******************/
  getEntryData(options = {}) {
    return new Promise((resolve, reject) => {
      options = Object.assign({}, options, options.query);
      if (!returnNoEmptyObject(options)) return resolve(null);
      let { sceneId, scene } = options;
      const { sid, usid, iid, cid, oid, wid, redirect } = options;
      if (sceneId || scene) {
        sceneId = sceneId || scene;
        post.getSceneContent({ sceneId }, res => {
          if (res.redirect) res.redirect = encodeURIComponent(res.redirect);
          const shareInfoData = { ...res, raw: options };
          resolve(shareInfoData);
        });
      } else if (iid || cid || oid) {
        const shareInfoData = {
          studentId: sid, userId: usid || wid,
          institutionId: iid, organizationId: cid || oid,
          redirect, raw: options
        };
        resolve(shareInfoData);
      } else {
        resolve(returnNoEmptyObject(this.data.tempEntryData) || returnNoEmptyObject(options) || {});
      }
    });
  },
  /*
   * 判断可用校区的
   * id 学生或员工的 id
   * identity 登录人身份（student/worker）
   * entryOrganizationId 扫码中的 oid
   */
  checkCampusOpen(id, identity = 'student', entryOrganizationId) {
    return new Promise((resolve, reject) => {
      // 发起请求
      if (identity === 'student') {
        const params = { studentId: id };
        post.checkStudentCampusOpen(params, _finish.bind(this));
      } else {
        const params = { userId: id };
        post.checkWorkerCampusOpen(params, _finish.bind(this));
      }

      // 请求结束
      function _finish(res = {}) {
        const list = res.onlineOrganizationDtos || [];

        // 没可选机构，直接登出
        if (list.length < 1) {
          return wx.showModal({
            title: '提示', confirmText: '登出',
            content: '您所在的机构皆未开通在线选课',
            success: () => {
              const params = identity === 'student' ? { studentId: id } : { userId: id };
              post.logout(params, () => {
                app.logout();
                wx.redirectTo({ url: '/pages/index/index' });
              });
            }
          });
        }

        const oldOrganizationId = wx.getStorageSync('organizationId');
        let oid = oldOrganizationId || res.studentOrganizationId || res.userOrganizationId;
        const inner = list.some((item) => {
          if (oid === item.organizationId) return true;
          // 如果码里的ID也能匹配上，就用码里的，否则用学员的，都没有则 inner 为 false
          if (entryOrganizationId === item.organizationId) {
            oid = entryOrganizationId; return true;
          }
        });

        // 可用则直接过，不可用则返回数据供 components/chooseCampus/index 组件处理
        inner ? resolve(oid) : reject(res);
      }
    });
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
    
    const { userId } = this.data.entryData || {};
    if (shareOpt.usid) shareOpt.usid = shareOpt.wid || userId;

    // 如果没有传入 webView 比如注册页，则用 entryData 来填充
    if (webview === '') {
      shareOpt = (this.data.entryData || {}).raw || {};
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
    wx.removeStorageSync('userId');
    wx.removeStorageSync('organizationId');
    // wx.redirectTo({ url: '/pages/index/index' });
  },
})