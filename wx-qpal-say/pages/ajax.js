
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
    _POST('入口', 'SouthGift/Enter', {
      code: code,
      iv: res.iv,
      encryptedDataStr: res.encryptedData,
      userJson: res.userInfo,
      Event: 'QingPu',
    }, callback);
  },
  //==============  请求 - 开始
  begin: function (uid, sid, callback) {
    _GET('开始', 'SouthGift/ScreenBegin', {
      UserGuid: uid,
      ScreenId: sid,
      Event: 'QingPu',
    }, callback);
  },
  //==============  请求 - 上传音频
  upload: function (uid, sid, did, callback) {
    _POST('上传音频', 'SouthGift/VerifyVoice', {
      UserGuid: uid,
      ScreenId: sid,
      ScreenDetailId: did,
      Event: 'QingPu',
    }, callback);
  },
  //==============  请求 - 上传音频验证
  justify: function (uid, sid, did, callback) {
    _POST('上传音频', 'SouthGift/VerifyVoice', {
      UserGuid: uid,
      ScreenId: sid,
      ScreenDetailId: did,
      Event: 'QingPu',
    }, callback);
  },
  //==============  请求 - 提现
  getMoney: function (uid, num, callback) {
    _POST('提现', 'SouthGift/Deposit', {
      UserGuid: uid,
      Amount: num + '',
      Event: 'QingPu',
    }, callback);
  },
}