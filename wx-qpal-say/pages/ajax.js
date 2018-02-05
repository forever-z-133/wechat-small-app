
import { extend, systemError } from '../utils/util.js';
const app = getApp();
let baseUrl = 'https://apimall.kdcer.com/api/';


function _AJAX(name, url, data, success) {
  wx.request({
    url: baseUrl + url,
    data: data,
    success: function (r) {
      if (systemError(r.data)) return;
      success && success(r.data);
      console.log(name, r.data);
    },
    fail: function (err) {
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
        if (systemError(r.data)) return;
        console.log('入口', r.data);
        callback && callback(r.data);
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
}