import { alert } from './util.js';

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
function _ajax_error(res, errorFn) {
  wx.hideLoading();
  wx.stopPullDownRefresh();
  var errMsg = (res.data && res.data.resultMessage) || JSON.stringify(res) || '系统错误';
  alert(errMsg, () => errorFn && errorFn(res));
}
function _ajax_success(res, callback, name, errorFn) {
  if (!/ok$/.test(res.errMsg)) return _ajax_error(res, errorFn);
  if (/DOCTYPE html/.test(res.data)) return _ajax_error(res, errorFn);
  if (res.data.resultCode != 0) return _ajax_error(res, errorFn);
  console.log(name || url, res.data.data);
  callback && callback(res.data.data, res.data);
}

var baseUrl = 'https://pre3.xuebangsoft.net/eduboss/wxapp/';
var testUrl = 'http://192.168.2.144:8080/eduboss/wxapp/';
// baseUrl = testUrl;
var apiUrl = 'WxAppLoginController';
var payApi = 'SpecialMerchantsPay';

var baseUrl2 = 'https://pre3.xuebangsoft.net/eduboss/';
// baseUrl2 = 'http://192.168.2.195:8080/eduboss/'

module.exports = {
  apiUrl: baseUrl + apiUrl,
  // --- 直取 UnionId，如果存在则不走 wx.getUserInfo 和 post.getUnionId
  getUnionIdDirect: function (data, callback, errorFn) {
    _GET(baseUrl + apiUrl + '/jsCode2Session.do', data, callback, '直取身份ID', errorFn);
  },
  // --- 请求获取 UnionId
  getUnionId: function (data, callback, errorFn) {
    _POST(baseUrl + apiUrl + '/decryptedData.do', data, callback, '拿取身份ID', errorFn);
  },
  // --- 直接获得学生ID，如果存在则不走登录过程
  getStudentIdDirect: function (data, callback, errorFn) {
    _GET(baseUrl + apiUrl + '/getStudentIdListByUnionId.do', data, callback, '已登录的学生ID', errorFn);
  },
  // --- 获取短信验证码
  getMsgCode: function (data, callback, errorFn) {
    _GET(baseUrl + apiUrl + '/sendVerificationCode.do', data, callback, '获取短信验证码', errorFn);
  },
  // --- 验证手机号与短信验证码，即 登录
  userLogin: function (data, callback, errorFn) {
    _GET(baseUrl + apiUrl + '/checkVerificationCode.do', data, callback, '用户登录', errorFn);
  },
  // --- 选择同个账号(手机号)下的不同学生
  chooseSameUser: function (data, callback, errorFn) {
    _GET(baseUrl + apiUrl + '/getStudentListByContact.do', data, callback, '选择登录账号', errorFn);
  },
  // --- 将学生ID与UID进行绑定
  bindStudentId: function (data, callback, errorFn) {
    _POST(baseUrl + apiUrl + '/addStudentWxAppUnionId.do', data, callback, '绑定身份与学员关系', errorFn);
  },
  // --- 获取 Token
  getToken: function (data, callback, errorFn) {
    _GET(baseUrl + apiUrl + '/generateToken.do', data, callback, '获取 Token', errorFn);
  },
  // --- 获取年级列表
  getGradeList: function (data, callback, errorFn) {
    _GET(baseUrl + 'WxAppRegisterController' + '/getGradeList.do', data, callback, '获取年级列表', errorFn);
  },
  // --- 获取自定义样式
  getRegisterPage: function (data, callback, errorFn) {
    _GET(baseUrl + 'WxAppRegisterController' + '/getRegisterPage.do', data, callback, '获取自定义样式', errorFn);
  },
  // --- 注册
  register: function (data, callback, errorFn) {
    _POST(baseUrl + 'WxAppRegisterController' + '/register.do', data, callback, '注册', errorFn);
  },
  // --- 获取转发二维码
  // getQrcode: function (data, callback, errorFn) {
  //   _GET(testUrl + 'WxAppRegisterController' + '/getWxAppQrCode.do', data, callback, '获取转发二维码', errorFn);
  // },
  // --- 获取转发二维码
  getQrcode: function (data, callback, errorFn) {
    var apiUrl = baseUrl + 'WxAppRegisterController' + '/getWxAppQrCode.do';
    var url = '?pagePath=' + data.path;
    url += '&token=Bearer ' + data.token;
    url += data.redirect ? '&redirect=' + data.redirect : '';
    console.log('分享二维码链接', url);
    url = apiUrl + url;
    return callback && callback(url);
  },
  // --- 获取支付签名
  getPayKeyValue: function (data, callback, errorFn) {
    wx.request({
      url: baseUrl + payApi + '/pay.do',
      data: data,
      header: {
        'Authorization': `Bearer ${data.token}`,
      },
      method: 'POST',
      fail: err => _ajax_error,
      complete: res => _ajax_success(res, callback, '获取支付签名', errorFn)
    });
  },
  // --- 获取订单ID
  getOrderInfo: function (data, callback, errorFn) {
    var token = data.token;
    delete data.token;
    wx.request({
      url: baseUrl + 'OnlineOrder/find.do',
      data: data,
      header: {
        'Authorization': `Bearer ${token}`,
      },
      method: 'GET',
      fail: err => _ajax_error,
      complete: res => _ajax_success(res, callback, '获取订单ID', errorFn)
    });
  },
  // --- 核销订单
  checkOrderStatus: function (data, callback, errorFn) {
    var token = data.token;
    delete data.token;
    wx.request({
      url: baseUrl + 'OnlineOrder/findStatus.do',
      data: data,
      header: {
        'Authorization': `Bearer ${token}`,
      },
      method: 'GET',
      fail: err => _ajax_error,
      complete: res => _ajax_success(res, callback, '核销订单', errorFn)
    });
  },



  // --- 收款modal -> 查订单
  getFundOrderDetail: function (data, callback, errorFn) {
    _GET(baseUrl2 + 'weChat/preFundsChangeHistoryWeChatController/getPreFundsChangeHistoryDetail.do', data, callback, '查推送订单', errorFn);
  },
  // --- 收款modal -> 获取支付签名
  startFundOrderPay: function (data, callback, errorFn) {
    _POST(baseUrl2 + 'weChat/preFundsChangeHistoryWeChatController/pay.do', data, callback, '获取推送支付签名', errorFn);
  },
}