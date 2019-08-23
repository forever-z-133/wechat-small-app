// pages/login/index.js
var app = getApp();
import {
  isTel, alert,
  urlAddSearch,
  getQueryString,
  returnNoEmptyObject
} from '../../utils/util.js';
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
    grand: -1,
    grandList: [],  // 只有 name 的
    grandRawList: [],  // 含 ID 的
    hasBind: false,
    telIsOk: false
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
      this.options = entryData || {};
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
    let { organizationId, institutionId } = this.options || {};
    if (!institutionId && !organizationId) return alert('缺少注册必需的参数，无法注册');

    wx.removeStorageSync('userId');
    wx.removeStorageSync('organizationId');

    // 仅推介商品时有此操作
    // 推介商品中的机构如果与登录人的机构不符，则得走注册
    const { redirect } = this.options || {};
    const productRecommendId = getQueryString('productRecommendId', redirect);
    this.productRecommendId = productRecommendId;
    if (productRecommendId) {
      const { unionId } = app.data;
      return post.getStudentByUnionId({ unionId }, (res) => {
        const [{ studentId, institutionId: iid } = {}] = (res || []).slice(-1);
        // 没有登录人
        if (!studentId || !iid) return this.startLogin();
        // 登录人机构与推介商品中机构不一致
        if (iid !== institutionId) {
          console.log('登录人机构与推介商品中机构不一致');
          return this.startLogin();
        }
        this.allIsOk(studentId, 'student');
      });
    }

    this.beforeLogin();
  },

  // ---------- 判断能否直接登录
  beforeLogin: function () {
    const { unionId } = app.data;
    wx.showLoading({ mask: true });
    post.getLoginIdDirect({ unionId }, (res = {}) => {
      const { studentIds = [], userIds = [] } = res;
      // 没有相应绑定的账户，走登录流程
      if (studentIds.concat(userIds).length < 1) {
        wx.hideLoading();
        return this.startLogin();
      }
      wx.hideLoading();
      // 有相应账户，直接通过
      let id, identity;
      if (studentIds.length >= 1) {
        id = studentIds[0]; identity = 'student';
      }
      if (userIds.length >= 1) {
        id = userIds[0]; identity = 'worker';
      }
      return this.allIsOk(id, identity);
    });
  },
  startLogin() {
    this.renderGrandList(); // 请求渲染学员年级
    this.renderStyle(() => {
      this.setData({ needLogin: true });
    });
  },

  // ---------- 获取短信验证码
  getMsgCode: function () {
    var tel = this.data.tel;
    timeout = 60;
    if (!isTel(tel)) return wx.showToast({ title: '请填写正确手机号', icon: 'none' });
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
  submit: function (e) {
    const { tel, code } = this.data;
    var params = { contact: tel, verifyCode: code };
    if (this.loading) return;
    this.loading = false;
    wx.showLoading({ mask: true });
    post.checkMsgCode(params, () => {
      this.chooseSameLogin(tel);
    }, this.stopTimeCount);
  },

  // ---------- 注册，新增学员
  register: function (e) {
    const { name: studentName, tel: contact, grand } = this.data;
    const { organizationId: campusId, institutionId, userId, studentId: referrerId } = this.options;
    var gradeId = this.data.grandRawList[grand].id;
    var data = { studentName, contact, gradeId, institutionId, campusId, userId, referrerId };
    this.closeModal();
    if (this.loading) return;
    this.loading = false;
    wx.showLoading({ mask: true });
    post.register(data, student => {
      const { studentId } = student;
      setTimeout(() => { // 数据库主从有延时，可能马上取不到
        this.loading = false;
        const { organizationId } = this.options || {};
        const id = studentId, identity = 'student';
        app.checkCampusOpen(id, identity, campusId).then((oid) => {
          wx.setStorageSync('organizationId', oid);
          this.bindLoginId(id, identity);
        }).catch(campusData => {
          campusData.temp = { id, identity };
          this.setData({ campusData, needLogin: false });
        });
      }, 500);
    }, this.stopTimeCount);
  },

  // ---------- 获取账户对应的学生ID，即请求登录
  chooseSameLogin: function () {
    const { tel } = this.data;
    var params = { contact: tel };
    post.chooseSameLogin(params, (res = {}) => {
      wx.hideLoading();
      const { wxAppStudentLoginDtos: students = [], wxAppUserLoginDtos: users = [] } = res;
      const loginUserData = students.concat(users);
      this.loading = false;

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
        if (inner.length < 1) return this.register();
        this.setData({ users: inner.concat(outer), showModal: true, studentIndex: -1 });
        return false;
      }

      // 一个人都没有，则直接注册
      if (loginUserData.length < 1) return this.register();

      // 很多人，去弹窗选人吧
      this.setData({ users: loginUserData, showModal: true, studentIndex: -1 });
    }, this.stopTimeCount);
  },

  // ---------- 弹窗选择账号
  chooseOk: function () {
    const index = this.data.studentIndex;
    if (Number(index) === -99) return this.register();

    const item = this.data.users[index];
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
  bindLoginId: function (id, identity, organizationId) {
    const { unionId } = app.data;
    let { institutionId = 1 } = this.options || {};
    var params = { unionId, institutionId };
    if (this.loading) return;
    this.loading = true;
    wx.showLoading({ mask: true });
    if (identity === 'student') {
      params.studentId = id;
      post.bindStudentId(params, res => {
        this.allIsOk(id, identity);
      }, this.stopTimeCount);
    } else {
      params.userId = id;
      post.bindWorkerId(params, res => {
        this.allIsOk(id, identity);
      }, this.stopTimeCount);
    }
  },

  // ---------- 全部登录和绑定已完成
  allIsOk: function (id, identity) {
    wx.hideLoading();
    this.loading = false;
    wx.showToast({ title: '登录成功' });

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
  // -------- 分享
  onShareAppMessage: function () {
    var json = app.createShareData();
    console.log('转发出去的链接', json.path);
    return json;
  },

  //////////////////////////////////////////////////////////////////////// 以下与业务逻辑无关

  // 获取年级列表
  renderGrandList: function (callback) {
    const { institutionId } = this.options || {};
    const params = { institutionId };
    post.getGradeList(params, res => {
      this.data.grandRawList = res.filter(x => x.state == '0');
      var list = res.reduce((re, x) => x.state == '0' ? re.concat([x.name]) : re, []);
      this.setData({ grandList: list });
      callback && callback();
    });
  },

  // 自定义注册样式
  renderStyle: function (callback) {
    const { institutionId } = this.options || {};
    const params = { institutionId };
    post.getRegisterPage(params, res => {
      const { backgroundUrl: bg, logoUrl: logo } = res;
      this.setData({ bg, logo });
      callback && callback();
    });
  },

  // 年级切换
  grandChange: function (e) {
    this.setData({ grand: Number(e.detail.value) });
    this.justifyForm();
  },

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
  inputName: function (e) {
    this.data.name = e.detail.value;
    this.justifyForm();
  },
  inputTel: function (e) {
    this.data.tel = e.detail.value;
    this.justifyForm();
  },
  inputCode: function (e) {
    this.data.code = e.detail.value;
    this.justifyForm();
  },
  justifyForm: function () {
    const { name, tel, code, grand } = this.data;
    if (!tel && !code) {
      this.setData({ loginTips: '注册并登陆', yes: false, telIsOk: false });
    } else if (!isTel(tel)) {
      this.setData({ loginTips: '手机号码不正确', yes: false, telIsOk: false });
    } else if (isTel(tel) && !code) {
      this.setData({ loginTips: '请填写短信验证码', yes: false, telIsOk: true });
    } else if (isTel(tel) && code && grand < 0) {
      this.setData({ loginTips: '请选择年级', yes: false, telIsOk: true });
    } else if (isTel(tel) && code && grand > -1 && !name) {
      this.setData({ loginTips: '请填写姓名', yes: false, telIsOk: true });
    } else if (isTel(tel) && code) {
      this.setData({ loginTips: '注册并登陆', yes: true, telIsOk: true });
    }
  },

  // ---------- 获取验证码的倒计时
  startTimeCount: function () {
    this.stopTimeCount();
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

  // --------- 已有账号，去登录
  toLogin () {
    let path = '/pages/index/index';
    const options = Object.keys(this.options).reduce((re, key) => {
      const value = this.options[key]
      if (value == undefined) return re;
      return re.concat(key + '=' + value);
    }, []);
    path = urlAddSearch(path, options.join('&'));
    path = urlAddSearch(path, 'fromRegister=true');
    wx.navigateTo({ url: path });
  },
})