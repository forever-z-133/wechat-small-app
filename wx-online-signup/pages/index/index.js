// pages/login/index.js
var app = getApp();
import { isTel, alert, getValueFromUrl } from '../../utils/util.js';
import post from '../../utils/post.js';
var msgTimer = null;  // 获取验证码后的倒计时
var timeout = 0;  // 倒计时时长
var notLogin = false; // 不是登录，是注册

Page({
  data: {
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
  },
  onLoad: function (options) {
    // 完成此过程后跳页的重定向
    this.redirect = getValueFromUrl('redirect', options);
    this.method = options.method;

    // 登出或丢失，则清空全局数据
    if (options.method == 'logout' || options.method == 'lose') {
      console.log('登出或丢失身份');
      app.data.sid = null;
      app.data.uid = null;
      app.data.oid = null;
      app.data.token = null;
      app.data._token = null;
      app.data.shareOpt = null;
      wx.removeStorageSync('shareImg');
    }
    if (options.method == 'logout') {
      wx.removeStorageSync('student');
      wx.removeStorageSync('organizationId');
    }

    if (app.data.shareOpt) {
      this.setData({ hasShareOpt: true });
      this.redirect = this.redirect || app.data.shareOpt.redirect;
    }

    // 存储推荐人
    var usid = getValueFromUrl('usid', options);
    app.data.usid = usid;
  },
  onShow: function () {
    wx.showLoading({ title: '获取授权...', mask: true });

    setTimeout(() => {
      // 获得 openid 和 unionid
      app.getUnionId(res => {
        app.data.oid = res.openid || res.openId;
        app.data.uid = res.unionid || res.unionId;

        if (!app.data.oid || !app.data.uid) {
          wx.hideLoading();
          return alert('系统错误：未能取得所需 UniondId');
        }

        this.beforeLogin();  // 如果已绑定学生ID的，可直接登录
      });
    }, 0);

    // 其他初始化
    // clearTimeout(msgTimer);
    this.justifyForm();
  },

  // ---------- 判断能否直接登录
  beforeLogin: function () {
    if (this.method === 'lose') {
      wx.hideLoading();
      this.method == '';
      return this.setData({ needLogin: true });
    }

    // 选择校区返回，后续已无操作，可直接登录
    var organizationId = app.data.organizationId;
    var student = app.data.student;
    if (organizationId && student) {
      app.data.student = null;
      app.data.campusData = null;
      app.data.organizationId = null;
      return this.bindStudentId(this.data.uid, student);
    }

    var data = { unionId: app.data.uid };
    post.getStudentIdDirect(data, users => {
      wx.hideLoading();
      // 容错，最初版本为字符串，后期改为了数组
      if (typeof users == 'string') {
        return this.allIsOk(users);
      }
      // 没有相应绑定的账户，走登录流程
      if (!Array.isArray(users) || users.length < 1) {
        return this.setData({ needLogin: true });
      }
      // 有相应账户，直接通过或进行选择
      if (users.length >= 1) {
        return this.allIsOk(users[0]);
      }
    });
  },

  // ---------- 获取短信验证码
  getMsgCode: function () {
    var tel = this.data.tel;
    timeout = 60;
    if (!isTel(tel)) return wx.showToast({ title: '请填写正确手机号', icon: 'none' });
    this.data.code = '';
    this.setData({ code: '' });
    var data = { contact: tel };
    wx.showLoading({ mask: true });
    post.getMsgCode(data, (res, raw) => {
      if (raw.businessCode != 0) alert(raw.resultMessage);
      wx.showToast({ title: '发送成功' });
      // 开启倒计时效果
      this.startTimeCount();
    });
  },

  // ---------- 点击登录按钮
  submit: function(e) {
    var tel = this.data.tel, code = this.data.code;
    var data = { contact: tel, verifyCode: code };
    wx.showLoading({ mask: true });
    post.userLogin(data, () => {
      this.chooseSameUser(tel);
    }, this.stopTimeCount);
  },

  // ---------- 获取账户对应的学生ID，即请求登录
  chooseSameUser: function (tel) {
    var data = { contact: tel };
    post.chooseSameUser(data, users => {
      wx.hideLoading();
      if (!Array.isArray(users) || users.length < 1) {
        this.stopTimeCount();
        if (app.data.shareOpt) {
          return wx.showModal({
            title: '温馨提示',
            content: '该账号不存在，可以去注册一个',
            confirmColor: '#108EE9',
            confirmText: '立即注册',
            success: () => {
              wx.redirectTo({ url: '/pages/register/index' });
            }
          });
        }
        return alert('该账号不存在');
      }
      
      if (users.length == 1) {
        app.data.sid = users[0].studentId;
        this.checkCampusOpen(users[0], () => {
          this.bindStudentId(this.data.uid, users[0]);
        });
      } else {
        this.setData({ users: users, showModal: true, studentIndex: -1 });
      }
    }, this.stopTimeCount);
  },

  // ---------- 弹窗选择账号
  chooseOk: function() {
    var student = this.data.users[this.data.studentIndex];
    if (!student) return alert('先选个账号吧');
    // 从已绑定的中进行选择，则不走绑定过程
    if (this.data.hasBind) {
      return this.allIsOk(student.studentId);
    }
    // 尚未绑定的情况，前往绑定
    this.checkCampusOpen(student, () => {
      this.bindStudentId(this.data.uid, student);
    });
  },

  // ---------- 检测学生所在校区是否开通
  checkCampusOpen(student, callback) {
    var data = {
      studentId: student.studentId,
    }
    // 获取开通了的校区
    post.getWxAppOpenCampus(data, res => {
      // var checkOpen = res.openOnlineOrganization;
      var list = res.onlineOrganizationDtos;
      var studentName = res.studentName;
      var organizationId = res.studentOrganizationId;
      if (list.length < 1) return alert('您所在的机构皆未开通在线选课');
      if (!checkOpen(list) && !res.openOnlineOrganization) {
        this.setData({ users: [], showModal: false, studentIndex: -1 });
        app.data.student = student;
        app.data.studentName = studentName;
        app.data.campusData = list;
        return wx.navigateTo({
          url: '/pages/chooseCampus/index',
        });
      }
      wx.setStorageSync('student', student);
      wx.setStorageSync('organizationId', student.campusId);
      callback && callback(student);
    });
    // 判断本人所在的校区是否开通了选课
    function checkOpen(data) {
      return data.some(campus => campus.organizationId === student.campusId);
    }
  },

  // ---------- 进行学生ID与 uid 的绑定
  bindStudentId: function (uid, student) {
    var data = {
      studentId: student.studentId,
      unionId: app.data.uid,
      institutionId: student.institutionId,
    }
    wx.showLoading({ mask: true });
    post.bindStudentId(data, res => {
      return this.allIsOk(student.studentId);
    }, this.stopTimeCount);
  },

  // ---------- 全部登录和绑定已完成
  allIsOk: function (sid) {
    app.data.sid = sid;
    wx.showToast({ title: '登录成功' });

    var params = { studentId: sid, userId: app.data.usid };
    (sid && app.data.usid) && post.addScanCodeLoginLog(params);


    // 跳往空白页
    wx.redirectTo({
      url: '/pages/empty/index' + '?jump=true&redirect=' + this.redirect,
    });
  },

  //////////////////////////////////////////////////////////////////////// 以下与业务逻辑无关

  // ---------- 选账号弹窗相关
  closeModal: function () {
    this.setData({ users: [], showModal: false, studentIndex: -1 });
  },
  chooseStudent: function (e) {
    var index = e.currentTarget.dataset.index;
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
    var tel = this.data.tel;
    var code = this.data.code;
    if (!tel && !code) {
      this.setData({ loginTips: notLogin ? '注册' : '登录', yes: false });
    } else if (!isTel(tel)) {
      this.setData({ loginTips: '手机号码不正确', yes: false });
      this.redirect = ''
    } else if (isTel(tel) && !code) {
      this.setData({ loginTips: '请填写短信验证码', yes: false });
    } else if (isTel(tel) && code) {
      this.setData({ loginTips: notLogin ? '注册' : '登录', yes: true });
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
    this.data.code = '';
    this.justifyForm();
  },
})