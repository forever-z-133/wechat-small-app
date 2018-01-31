
import { extend } from '../utils/util.js';
const app = getApp();
let baseUrl = 'https://ApiMall.kdcer.com/api/page/';
// let baseUrl = app.data.baseUrl + 'page/';
// let baseUrl = 'https://sum.kdcer.com/api/OpenShop/';

function _AJAX(name, url, data, success) {
  wx.request({
    url: baseUrl + url,
    data: data,
    success: function (r) {
      if (app.systemError(r)) return;
      success && success(r.data);
      console.log(name, r.data);
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
  page: function (name = '首页', callback) {
    // return setTimeout(callback, 1000)
    _AJAX('拿取页面', 'PageGainTitleInfo', {
      Title: name,
    }, function (res) {
      if (!res.State) { _error('系统错误'); return; }
      res.PageData.map(x => {
        for (let i in x) x[i] = JSON.parse(x[i]);
        return x;
      });
      callback && callback(res)
    });
  },
  list: function(callback) {
    callback && callback() 
  }
}

function _error(tip) {
  wx.showModal({
    content: '系统错误',
    showCancel: false,
  });
}