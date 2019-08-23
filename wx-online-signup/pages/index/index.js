// pages/login/index.js
var app = getApp();
import { isTel, alert, getQueryString, returnNoEmptyObject } from '../../utils/util.js';
import post from '../../utils/post.js';
var msgTimer = null;  // 获取验证码后的倒计时
var timeout = 0;  // 倒计时时长
var notLogin = false; // 不是登录，是注册

Page({
  data: {
    campusData: undefined,
    needLogin: false,
    tel: '',
    code: '',
    yes_msg: true,
    msgTips: '获取验证码', // 获取按钮上的文字
    yes: false,  // 能登录
    loginTips: '登录', // 登录按钮上的文字
    showModal: false,
    users: [],
    studentIndex: -1,
    telIsOk: false,
    hasShareOpt: false,  // 是否从注册而来
  },
  onLoad: function (options) {
    this.options = options;
  },
  onShow: function () {
    const { env_now, wx_auth, openId, unionId } = app.data;

    if (!this.count || this.count < 2) { this.count = 1 + (this.count || 0); return; }
    if (!returnNoEmptyObject(env_now)) return;
    if (!returnNoEmptyObject(wx_auth)) return;
    if (!openId || !unionId) return alert('系统错误：未能取得所需 UnionId');

    wx.showLoading({ mask: true });
    app.getEntryData(this.options).then(entryData => {
      console.log('扫码结果', entryData);
      if (!entryData) return;
      this.options = entryData;
      wx.setStorageSync('entryData', entryData);
    }).then(() => {
      this.baseDataIsOK();
    });
  },
  campusChange({ detail = {} }) {
    const { organizationId } = detail;
    const { campusData: { temp: { id, identity } = {} } } = this.data;
    wx.setStorageSync('organizationId', organizationId);
    this.setData({ campusData: null });
    this.bindLoginId(id, identity);
  },
  baseDataIsOK() {
    wx.removeStorageSync('userId');
    wx.removeStorageSync('organizationId');

    // 登出
    const { method } = this.options;
    if (method === 'logout') {
      return setTimeout(() => {
        wx.hideLoading();
        this.setData({ needLogin: true });
        return app.logout();
      }, 300);
    }

    // 仅推介商品时有此操作
    // 推介商品中的机构如果与登录人的机构不符，则得走注册
    const { redirect, institutionId } = this.options || {};
    const productRecommendId = getQueryString('productRecommendId', redirect);
    this.productRecommendId = productRecommendId;
    if (productRecommendId) {
      const { unionId } = app.data;
      return post.getStudentByUnionId({ unionId }, (res) => {
        const [{ studentId, institutionId: iid } = {}] = (res || []).slice(-1);
        // 没有登录人
        if (!studentId || !iid) return this.setData({ needLogin: true });
        // 登录人机构与推介商品中机构不一致
        if (iid !== institutionId) return this.setData({ needLogin: true });
        this.allIsOk(studentId, 'student');
      });
    }

    this.beforeLogin();
  },

  // ---------- 判断能否直接登录
  beforeLogin: function () {
    const { unionId } = app.data;
    post.getLoginIdDirect({ unionId }, (res = {}) => {
      const { studentIds = [], userIds = [] } = res;
      // 没有相应绑定的账户，走登录流程
      if (studentIds.concat(userIds).length < 1) {
        wx.hideLoading();
        return this.setData({ needLogin: true });
      }
      // 有相应账户，直接通过
      let id, identity;
      if (studentIds.length >= 1) {
        id = studentIds[0]; identity = 'student';
      }
      if (userIds.length >= 1) {
        id = userIds[0]; identity = 'worker';
      }
      wx.hideLoading();
      return this.allIsOk(id, identity);
    });
  },

  // ---------- 获取短信验证码
  getMsgCode: function () {
    var tel = this.data.tel;
    timeout = 60;
    if (!isTel(tel)) return wx.showToast({ title: '请填写正确手机号', icon: 'none' });
    this.data.code = '';
    this.setData({ code: '' });
    var params = { contact: tel };
    wx.showLoading({ mask: true });
    post.getMsgCode(params, (res, raw) => {
      if (raw.businessCode != 0) alert(raw.resultMessage);
      wx.showToast({ title: '发送成功' });
      // 开启倒计时效果
      this.startTimeCount();
    });
  },

  // ---------- 点击登录按钮
  submit: function(e) {
    const { tel, code } = this.data;
    var params = { contact: tel, verifyCode: code };
    if (this.loading) return;
    this.loading = true;
    wx.showLoading({ mask: true });
    post.checkMsgCode(params, () => {
      this.chooseSameLogin();
    }, this.stopTimeCount);
  },

  // ---------- 查询能登录的学员或员工列表
  chooseSameLogin: function () {
    const { tel } = this.data;
    var params = { contact: tel };
    post.chooseSameLogin(params, (res = {}) => {
      wx.hideLoading();
      this.loading = false;
      const { wxAppStudentLoginDtos: students = [], wxAppUserLoginDtos: users = [] } = res;
      const loginUserData = students.concat(users);

      // #15608 从推介商品来的，需对选择列表进行一些调整
      if (this.productRecommendId) {
        const { institutionId: iid } = this.options;
        const temp = loginUserData.reduce(([inner, outer], item) => {
          const { institutionId } = item;
          item.disabled = iid != institutionId;
          iid == institutionId ? inner.push(item) : outer.push(item);
          return [inner, outer];
        }, [[], []]);
        const [inner, outer] = temp;
        // 一个人都没有，则直接注册
        if (inner.length < 1) return this.alertToRegister();
        // 很多人，去弹窗选人吧
        if (inner.length > 1) {
          return this.setData({ users: inner.concat(outer), showModal: true, studentIndex: -1 });
        }
        // 有一个人，直接登录
        login.call(this, inner[0]);
        return false;
      }

      if (loginUserData.length < 1) {
        // 一个人都没有，则前往注册
        return this.alertToRegister();
      } else if (loginUserData.length === 1) {
        // 有一个人，直接登录
        login.call(this, loginUserData[0]);
      } else {
        // 很多人，去弹窗选人吧
        this.setData({ users: loginUserData, showModal: true, studentIndex: -1 });
      }

      function login(data) {
        const id = data.studentId || data.userId;
        const identity = data.studentId ? 'student' : 'worker';
        if (!id) return alert('出问题啦！');

        const { organizationId } = this.options || {};
        app.checkCampusOpen(id, identity, organizationId).then((oid) => {
          wx.setStorageSync('organizationId', oid);
          this.bindLoginId(id, identity);
        }).catch(campusData => {
          campusData.temp = { id, identity };
          this.setData({ campusData, needLogin: false });
        });
      }
    }, this.stopTimeCount);
  },

  // ---------- 弹窗选择账号
  chooseOk: function() {
    var item = this.data.users[this.data.studentIndex];
    if (!item) return alert('先选个账号吧');

    const identity = item.studentId ? 'student' : 'worker';
    const id = item.studentId || item.userId || '';

    this.closeModal();

    const { organizationId } = this.options || {};
    app.checkCampusOpen(id, identity, organizationId).then((oid) => {
      wx.setStorageSync('organizationId', oid);
      this.bindLoginId(id, identity);
    }).catch(campusData => {
      campusData.temp = { id, identity };
      this.setData({ campusData, needLogin: false });
    });
  },

  // ---------- 进行学生ID与 unionId 的绑定
  bindLoginId: function (id, identity) {
    if (!id || !identity) return alert('请检查 bindLoginId 入参');
    const { unionId } = app.data;
    let { institutionId = 1 } = this.options || {};
    var params = { unionId, institutionId };
    wx.showLoading({ mask: true });
    if (identity === 'student') {
      params.studentId = id;
      post.bindStudentId(params, res => {
        wx.hideLoading();
        this.allIsOk(id, identity);
      }, this.stopTimeCount);
    } else {
      params.userId = id;
      post.bindWorkerId(params, res => {
        wx.hideLoading();
        this.allIsOk(id, identity);
      }, this.stopTimeCount);
    }
  },

  // ---------- 全部登录和绑定已完成
  allIsOk: function (id, identity) {
    const user = { id, identity };
    wx.setStorageSync('user', user);
    app.data.user = user; // 可能 setStorageSync 有时不够及时

    // 有推荐人时进行记录
    const { userId } = this.options || {};
    wx.setStorageSync('userId', userId);
    if (identity === 'student' && id && userId) {
      var params = { studentId: id, userId: userId };
      post.addScanCodeLoginLog(params);
    }

    // 所有结束，跳往空白页(为了左上角的箭头)，再跳往目标页
    let { redirect = '' } = this.options || {};
    redirect = redirect ? '&redirect=' + redirect : '';
    wx.redirectTo({ url: '/pages/empty/index' + '?jump=true' + redirect });
  },

  //////////////////////////////////////////////////////////////////////// 以下与业务逻辑无关

  // ---------- 选账号弹窗相关
  closeModal: function () {
    this.setData({ users: [], showModal: false, studentIndex: -1 });
  },
  chooseStudent: function (e) {
    const { index, disabled } = e.currentTarget.dataset;
    if (disabled) return this.productRecommendId ? alert('选择的账户无法购买跨机构的推介商品。') : null;
    this.setData({ studentIndex: index });
  },

  // ---------- 表单验证
  inputTel: function (e) {
    this.data.tel = e.detail.value;
    this.justifyForm();
  },
  inputCode: function (e) {
    this.data.code = e.detail.value;
    this.justifyForm();
  },
  justifyForm: function() {
    const { tel, code } = this.data;
    if (!tel && !code) {
      this.setData({ loginTips: notLogin ? '注册' : '登录', yes: false, telIsOk: false });
    } else if (!isTel(tel)) {
      this.setData({ loginTips: '手机号码不正确', yes: false, telIsOk: false });
      this.redirect = ''
    } else if (isTel(tel) && !code) {
      this.setData({ loginTips: '请填写短信验证码', yes: false, telIsOk: true });
    } else if (isTel(tel) && code) {
      this.setData({ loginTips: notLogin ? '注册' : '登录', yes: true, telIsOk: true });
    }
  },

  // ---------- 获取验证码的倒计时
  startTimeCount: function () {
    this.setData({ yes_msg: false, msgTips: timeout + 's' });
    msgTimer = setInterval(() => {
      if (--timeout < 1) {
        this.stopTimeCount();
      } else {
        this.setData({ msgTips: timeout + 's' });
      }
    }, 1000);
  },
  stopTimeCount: function () {
    clearInterval(msgTimer); msgTimer = null;
    this.setData({ yes_msg: true, msgTips: '重新获取' });
    this.loading = false;
    this.data.code = '';
    this.justifyForm();
  },

  // ----------- 莫得人选，跳往去注册
  alertToRegister() {
    if (!wx.getStorageSync('entryData')) {
      return alert('该账号不存在');
    } else {
      wx.showModal({
        title: '温馨提示',
        content: '该账号不存在，可以去注册一个',
        confirmColor: '#108EE9',
        confirmText: '立即注册',
        success: () => {
          wx.redirectTo({ url: '/pages/register/index' });
        }
      });
    }
  },
})