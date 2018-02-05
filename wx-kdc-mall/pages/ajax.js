
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
      if (systemError(r.data)) return;
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
  //==============  请求 - 加入购物车
  toCart: function (token, skuId, callback) {
    _AJAX('加入购物车', 'Cart/ShopInCommodity', {
      token: token,
      id: skuId,
    }, callback);
  },
  //==============  请求 - 购物车列表
  cart_list: function (token, callback) {
    _AJAX('购物车列表', 'Cart/GetUserShopCart', {
      token: token,
    }, callback);
  },
  //==============  请求 - 生成草稿订单
  toOrder: function (token, ids, json, callback) {
    _AJAX('生成草稿订单', 'Order/PlaceOrder', {
      token: token,
      cartId: ids.join(','),
      fieldsJson: null,
    }, callback);
  },
  //==============  请求 - 拿取地址列表
  address: function (user, callback) {
    _AJAX('地址列表', 'crm/GetAddressList', {
      token: user
    }, callback);
  },
  //==============  请求 - 新增地址
  add_address: function (user, json, callback) {
    _AJAX('新增地址', 'crm/InAddress', {
      token: user,
      addJson: JSON.stringify(json)
    }, callback);
  },
  //==============  请求 - 修改地址
  edit_address: function (user, json, callback) {
    console.log(json)
    _AJAX('修改地址', 'crm/InAddress', {
      token: user,
      addJson: JSON.stringify(json)
    }, callback);
  },
  //==============  请求 - 删除地址
  remove_address: function (id, callback) {
    _AJAX('删除地址', 'crm/DeleteAddrss', {
      id: id
    }, callback);
  },
  //==============  请求 - 订单与地址绑定
  bind_address: function (order, address, callback) {
    _AJAX('订单绑定地址', 'Order/DraftOrderInfo', {
      draftId: address,
      addressId: address,
    }, callback);
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