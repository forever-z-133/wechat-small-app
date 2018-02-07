
import { extend, systemError } from '../utils/util.js';
const app = getApp();
let baseUrl = 'https://sum.kdcer.com/api/';


function _AJAX(type = 'POST', name, url, data, success) {
  wx.request({
    url: baseUrl + url,
    data: data,
    method: type,
    success: function (r) {
      if (systemError(r.data)) return;
      console.log(name, r.data);
      success && success(r.data);
    },
    fail: function (err) {
      wx.hideLoading();
      wx.hideToast();
      wx.stopPullDownRefresh();
      wx.showModal({
        title: name + '接口错误',
        content: JSON.stringify(err),
      });
    },
  });
}
function _GET(name, url, data, success) {
  _AJAX('GET', name, url, data, success)
}
function _POST(name, url, data, success) {
  _AJAX('POST', name, url, data, success)
}


module.exports = {
  //==============  请求 - 入口
  entry: function(code, res, callback) {
    _POST('入口', 'Central/Enter', {
      code: code,
      iv: res.iv,
      encryptedDataStr: res.encryptedData,
      userJson: res.userInfo,
    }, callback);
  },
  //==============  请求 - 抽奖
  getPrize: function (uid, tel, callback) {
    _GET('抽奖', 'Central/GetBonus', {
      OpenId: uid,
      Phone: tel,
    }, callback);
  },
}