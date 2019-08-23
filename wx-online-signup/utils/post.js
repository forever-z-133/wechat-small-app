import { alert, chooseEnviromentFirst } from './util.js';

function _Ajax(url, data, callback, methods, name, errorFn) {
  wx.request({
    url: url,
    data: data,
    method: methods || 'GET',
    fail: err => _ajax_error,
    complete: res => _ajax_success(res, callback, name, errorFn)
  })
}
function _GET(url, data, callback, name, errorFn) {
  _Ajax(url, data, callback, 'GET', name, errorFn);
}
function _POST(url, data, callback, name, errorFn) {
  _Ajax(url, data, callback, 'POST', name, errorFn);
}

function _Ajax2(url, data, callback, methods, name, errorFn) {
  var token = data.token;
  delete data.token;
  if (!token) return alert('缺少必要 token 无法进行请求');
  wx.request({
    url: url,
    data: data,
    header: {
      'Authorization': `Bearer ${token}`,
    },
    method: methods || 'GET',
    fail: err => _ajax_error,
    complete: res => _ajax_success(res, callback, name, errorFn)
  });
}
function _GET2(url, data, callback, name, errorFn) {
  _Ajax2(url, data, callback, 'GET', name, errorFn);
}
function _POST2(url, data, callback, name, errorFn) {
  _Ajax2(url, data, callback, 'POST', name, errorFn);
}

function _ajax_error(res, errorFn) {
  if (errorFn === false) return;
  wx.hideLoading();
  wx.stopPullDownRefresh();
  var errMsg = (res.data && res.data.resultMessage) || '系统错误';
  if (errMsg.indexOf('due to error code') > -1) {
    errMsg = '服务忙，请稍后再试';
  }
  console.error(errMsg, res);
  alert(errMsg, () => errorFn && errorFn(res));
}
function _ajax_success(res, callback, name, errorFn) {
  wx.hideLoading();
  if (!/ok$/.test(res.errMsg)) {
    console.error(res);
    return alert('微信服务忙，请关闭小程序重新扫码进入', () => errorFn && errorFn(res));
  }
  if (/DOCTYPE html/i.test(res.data)) {
    console.error(res);
    return alert('部署中，稍后再来', () => errorFn && errorFn(res));
  }
  if (res.data.resultCode) {
    return _ajax_error(res, errorFn);
  }
  callback && callback(res.data.data, res.data);
}

let baseUrl = '';

var apiUrl = 'WxAppLoginController';
var payApi = 'SpecialMerchantsPay';

module.exports = {
  // apiUrl: baseUrl + apiUrl,
  // --- 直取 UnionId，如果存在则不走 wx.getUserInfo 和 post.getUnionId
  getUnionIdDirect: function (data, callback, errorFn) {
    if (!(baseUrl = chooseEnviromentFirst('apiUrl'))) return;
    // baseUrl = 'https://uat3.xuebangsoft.net/eduboss/wxapp/';
    _GET(baseUrl + apiUrl + '/jsCode2Session.do', data, callback, '直取身份ID', errorFn);
  },
  // 
  getStudentByUnionId: function (data, callback, errorFn) {
    if (!(baseUrl = chooseEnviromentFirst('apiUrl'))) return;
    _GET(baseUrl + apiUrl + '/getStudentByUnionId.do', data, callback, '推荐商品时，直取学员信息', errorFn);
  },
  // --- 请求获取 UnionId
  getUnionId: function (data, callback, errorFn) {
    if (!(baseUrl = chooseEnviromentFirst('apiUrl'))) return;
    _POST(baseUrl + apiUrl + '/decryptedData.do', data, callback, '拿取身份ID', errorFn);
  },
  // --- 获取分享相关参数
  getSceneContent: function (data, callback, errorFn) {
    if (!(baseUrl = chooseEnviromentFirst('apiUrl'))) return;
    // baseUrl = 'http://localhost:8080/eduboss/wxapp/';
    _GET(baseUrl + 'WxAppRegisterController' + '/getSceneContent.do', data, callback, '获取分享相关参数', errorFn);
  },
  // --- 直接获得学生ID，如果存在则不走登录过程
  getLoginIdDirect: function (data, callback, errorFn) {
    if (!(baseUrl = chooseEnviromentFirst('apiUrl'))) return;
    _GET(baseUrl + apiUrl + '/getLoginListByUnionId.do', data, callback, '已登录的学生ID', errorFn);
  },
  // --- 获取短信验证码
  getMsgCode: function (data, callback, errorFn) {
    if (!(baseUrl = chooseEnviromentFirst('apiUrl'))) return;
    _GET(baseUrl + apiUrl + '/sendVerificationCode.do', data, callback, '获取短信验证码', errorFn);
  },
  // --- 验证手机号与短信验证码，即 登录
  checkMsgCode: function (data, callback, errorFn) {
    if (!(baseUrl = chooseEnviromentFirst('apiUrl'))) return;
    _GET(baseUrl + apiUrl + '/checkVerificationCode.do', data, callback, '用户登录', errorFn);
  },
  // --- 选择同个账号(手机号)下的不同学生
  chooseSameLogin: function (data, callback, errorFn) {
    if (!(baseUrl = chooseEnviromentFirst('apiUrl'))) return;
    _GET(baseUrl + apiUrl + '/getLoginListByContact.do', data, callback, '选择登录账号', errorFn);
  },
  // --- 将学生ID与UID进行绑定
  bindStudentId: function (data, callback, errorFn) {
    if (!(baseUrl = chooseEnviromentFirst('apiUrl'))) return;
    _POST(baseUrl + apiUrl + '/addStudentWxAppUnionId.do', data, callback, '绑定身份与学员关系', errorFn);
  },
  // --- 将员工ID与UID进行绑定
  bindWorkerId: function (data, callback, errorFn) {
    if (!(baseUrl = chooseEnviromentFirst('apiUrl'))) return;
    _POST(baseUrl + apiUrl + '/addUserWxAppUnionId.do', data, callback, '绑定身份与员工关系', errorFn);
  },
  // --- 获取 Token
  getToken: function (data, callback, errorFn) {
    if (!(baseUrl = chooseEnviromentFirst('apiUrl'))) return;
    _GET(baseUrl + apiUrl + '/generateToken.do', data, callback, '获取 Token', errorFn);
  },
  // --- 获取年级列表
  getGradeList: function (data, callback, errorFn) {
    if (!(baseUrl = chooseEnviromentFirst('apiUrl'))) return;
    _GET(baseUrl + 'WxAppRegisterController' + '/getGradeList.do', data, callback, '获取年级列表', errorFn);
  },
  // --- 获取自定义样式
  getRegisterPage: function (data, callback, errorFn) {
    if (!(baseUrl = chooseEnviromentFirst('apiUrl'))) return;
    _GET(baseUrl + 'WxAppRegisterController' + '/getRegisterPage.do', data, callback, '获取自定义样式', errorFn);
  },
  // --- 获取开通了功能的校区 - 学员
  checkStudentCampusOpen: function (data, callback, errorFn) {
    if (!(baseUrl = chooseEnviromentFirst('apiUrl'))) return;
    _GET(baseUrl + 'WxAppLoginController' + '/getWxAppOnlineOrganizationByStudentId.do', data, callback, '该学员能访问的校区', errorFn);
  },
  // --- 获取开通了功能的校区 - 员工
  checkWorkerCampusOpen: function (data, callback, errorFn) {
    if (!(baseUrl = chooseEnviromentFirst('apiUrl'))) return;
    _GET(baseUrl + 'WxAppLoginController' + '/getWxAppOnlineOrganizationByUserId.do', data, callback, '该员工能访问的校区', errorFn);
  },
  // --- 注册
  register: function (data, callback, errorFn) {
    if (!(baseUrl = chooseEnviromentFirst('apiUrl'))) return;
    _POST(baseUrl + 'WxAppRegisterController' + '/register.do', data, callback, '注册', errorFn);
  },
  // --- 获取转发二维码
  getNormalQrcode: function (data, callback, errorFn) {
    if (!(baseUrl = chooseEnviromentFirst('apiUrl'))) return;
    // baseUrl = 'http://localhost:8080/eduboss/wxapp/';
    var apiUrl = baseUrl + 'WxAppRegisterController' + '/getWxAppQrCode.do';
    var url = '?pagePath=' + data.path.replace(/^\//, '');
    url += '&token=Bearer ' + data.token;
    url += data.redirect ? '&redirect=' + data.redirect : '';
    console.log('分享二维码链接', url);
    url = apiUrl + url;
    return callback && callback(url);
  },
  getUserQrcode: function (data, callback, errorFn) {
    if (!(baseUrl = chooseEnviromentFirst('apiUrl'))) return;
    var apiUrl = baseUrl + 'WxAppRegisterController' + '/getUserWxAppQrCode.do';
    var url = '?pagePath=' + data.path.replace(/^\//, '');
    url += '&token=Bearer ' + data.token;
    url += '&campusId=' + wx.getStorageSync('organizationId');
    url += data.redirect ? '&redirect=' + data.redirect : '';
    console.log('分享二维码链接', url);
    url = apiUrl + url;
    return callback && callback(url);
  },
  // --- 获取支付方式
  getPayType: function (data, callback, errorFn) {
    if (!(baseUrl = chooseEnviromentFirst('apiUrl'))) return;
    // baseUrl = 'http://localhost:8080/eduboss/wxapp/'
    _GET2(baseUrl + payApi + '/getPayType.do', data, callback, '获取支付方式', errorFn);
  },
  // --- 获取支付签名
  getPayKeyValue: function (data, callback, errorFn) {
    if (!(baseUrl = chooseEnviromentFirst('apiUrl'))) return;
    // baseUrl = 'http://wxxxtsat.nat300.top/eduboss/wxapp/'
    _POST2(baseUrl + payApi + '/pay.do', data, callback, '获取支付签名', errorFn);
  },
  // --- 获取汇付支付签名
  getHuifuPayKeyValue: function (data, callback, errorFn) {
    if (!(baseUrl = chooseEnviromentFirst('apiUrl'))) return;
    // baseUrl = 'http://localhost:8080/eduboss/wxapp/'
    _POST2(baseUrl + payApi + '/payByHuiFu.do', data, callback, '获取支付签名', errorFn);
  },
  // --- 获取订单ID
  getOrderInfo: function (data, callback, errorFn) {
    if (!(baseUrl = chooseEnviromentFirst('apiUrl'))) return;
    _GET2(baseUrl + 'OnlineOrder/find.do', data, callback, '获取订单ID', errorFn);
  },
  // --- 核销订单
  checkOrderStatus: function (data, callback, errorFn) {
    if (!(baseUrl = chooseEnviromentFirst('apiUrl'))) return;
    _GET2(baseUrl + 'OnlineOrder/findStatus.do', data, callback, '核销订单', errorFn);
  },
  // --- 更新订单状态
  updateOrderStatus: function (data, callback, errorFn) {
    if (!(baseUrl = chooseEnviromentFirst('apiUrl'))) return;
    _POST2(baseUrl + 'OnlineOrder/updateStatus.do', data, callback, '更新订单状态', errorFn);
  },
  // --- 生成合同
  addContractByOrderId: function (data, callback, errorFn) {
    if (!(baseUrl = chooseEnviromentFirst('apiUrl'))) return;
    _GET2(baseUrl + 'OnlineOrderContract/addContractByOrderId.do', data, callback, '生成合同', errorFn);
  },

  // --- 收款modal -> 查订单
  getFundOrderDetail: function (data, callback, errorFn) {
    if (!(baseUrl = chooseEnviromentFirst('apiUrl2'))) return;
    // baseUrl = 'http://wxxxtsat.nat300.top/eduboss/'
    _GET(baseUrl + 'wxapp/PreFundsChangeHistoryWeChatController/getPreFundsChangeHistoryDetail.do', data, callback, '查推送订单', errorFn);
  },
  // --- 收款modal -> 获取支付签名
  startFundOrderPay: function (data, callback, errorFn) {
    if (!(baseUrl = chooseEnviromentFirst('apiUrl2'))) return;
    // baseUrl = 'http://wxxxtsat.nat300.top/eduboss/'
    _POST(baseUrl + 'wxapp/PreFundsChangeHistoryWeChatController/pay.do', data, callback, '获取推送支付签名', errorFn);
  },

  // --- 更新推荐人
  addScanCodeLoginLog: function (data, callback, errorFn) {
    if (!(baseUrl = chooseEnviromentFirst('apiUrl'))) return;
    _POST(baseUrl + 'WxAppRegisterController/addScanCodeLoginLog.do', data, callback, '更新推荐人', false);
  },
  // --- 登出
  logout: function (data, callback, errorFn) {
    if (!(baseUrl = chooseEnviromentFirst('apiUrl'))) return;
    _POST(baseUrl + 'WxAppLoginController/logout.do', data, callback, '登出', false);
  },
  // --- 推荐卡详情
  getProductRecommendDetail: function (data, callback, errorFn) {
    if (!(baseUrl = chooseEnviromentFirst('apiUrl'))) return;
    _GET(baseUrl + 'WxAppProductRecommendWxAppController/findById.do', data, callback, '推荐卡详情', errorFn);
  },
}