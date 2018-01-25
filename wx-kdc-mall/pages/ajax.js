
import { extend } from '../utils/util.js';
const app = getApp();
// const baseUrl = app.data.baseUrl;
const baseUrl = 'https://sum.kdcer.com/api/OpenShop/';

function _AJAX(name, url, data, success) {
  wx.request({
    url: baseUrl + url,
    data: data,
    success: function (r) {
      if (app.systemError(r)) return;
      console.log(name, r.data);
      success && success(r);
    },
    fail: function(err) {
      wx.showModal({
        title: name + '接口错误',
        content: JSON.stringify(err),
      });
    }
  });
}

module.exports = {
  //==============  请求 - 入口
  entry: function (code, res, callback) {
    _AJAX('入口', 'CodeToSeckill', {
      code: code,
      iv: res.iv,
      encryptedDataStr: res.encryptedData,
      userJson: JSON.stringify(res.userInfo),
    }, callback);
  },
  //==============  请求 - 存 formId
  save: function (uid, formId, callback) {
    _AJAX('存 formId', 'FormSeckill', {
      UnionId: uid,
      FormId: formId,
    }, callback);
  },
  //==============  请求 - 拿取页面
  page: function (name, callback) {
    return setTimeout(callback, 1000)
    _AJAX('拿取页面', 'AddCardSeckill', {
      UnionId: uid,
    }, callback);
  }
}