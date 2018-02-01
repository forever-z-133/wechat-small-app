
import { extend, systemError } from '../utils/util.js';
const app = getApp();
let baseUrl = 'https://apimall.kdcer.com/api/';
// let baseUrl = app.data.baseUrl + 'page/';
// let baseUrl = 'https://sum.kdcer.com/api/OpenShop/';

function _AJAX(name, url, data, success) {
  wx.request({
    url: baseUrl + url,
    data: data,
    success: function (r) {
      if (systemError(r)) return;
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
    wx.request({
      url: 'https://apimall.kdcer.com/api/user/CodeToSession',
      method: 'POST',
      data: {
        code: code,
        iv: res.iv,
        encryptedDataStr: res.encryptedData,
        userJson: JSON.stringify(res.userInfo),
      },
      success: function (r) {
        if (systemError(r)) return;
        callback && callback(r.data);
        console.log('入口', r.data);
      },
      fail: function (err) {
        wx.showModal({
          title: '入口' + '接口错误',
          content: JSON.stringify(err),
        });
      }
    });
  },
  //==============  请求 - 拿取页面
  page: function (name = '首页', callback) {
    _AJAX('拿取页面', 'page/PageGainTitleInfo', {
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
  //==============  请求 - 详情页
  detail: function (id, callback) {
    _AJAX('详情页', 'Commodity/CommodityInfo', {
      Id: id,
    }, function (res) {
      if (!res.State) { _error('系统错误'); return; }
      callback && callback(res)
    });
  },
  //==============  请求 - 拿取页面
  list: function (callback) {
    callback && callback()
  },
  //==============  请求 - 存 formId
  save: function (uid, formId, callback) {
    _AJAX('存 formId', 'FormSeckill', {
      UnionId: uid,
      FormId: formId,
    }, callback);
  },
}

function _error(tip) {
  wx.showModal({
    content: '系统错误',
    showCancel: false,
  });
}