const baseUrl = 'https://sum.kdcer.com/api/OpenShop/'

module.exports = {
  //==============  请求 - 入口
  entry: function (code, res, callback) {
    wx.request({
      url: baseUrl + 'CodeToSeckill',
      data: {
        code: code,
        iv: res.iv,
        encryptedDataStr: res.encryptedData,
        userJson: JSON.stringify(res.userInfo),
      },
      success: function (r) {
        console.log('入口', r.data);
        callback && callback(r);
      }
    })
  },
  //==============  请求 - 预约
  prev: function (callback) {
    wx.request({
      url: baseUrl + 'CodeToSeckill',
      data: {
        code: GUID,
      },
      success: function (r) {
        console.log('预约', r.data);
        callback && callback(r);
      }
    })
  },
  //==============  请求 - 存 formId
  save: function (formId, callback) {
    wx.request({
      url: baseUrl + 'CodeToSeckill',
      data: {
        code: GUID,
        formId: formId,
      },
      success: function (r) {
        console.log('存 formId', r.data);
        callback && callback(r);
      }
    })
  },
  //==============  请求 - 抽奖
  prize: function (callback) {
    wx.request({
      url: baseUrl + 'CodeToSeckill',
      data: {
        code: GUID,
      },
      success: function (r) {
        console.log('抽奖', r.data);
        callback && callback(r);
      }
    })
  },
  //==============  请求 - 添加到卡包
  card: function (callback, before) {
    wx.request({
      url: baseUrl + 'CodeToSeckill',
      data: {
        code: GUID,
      },
      success: function (r) {
        console.log('抽奖', r.data);
        before && before(r);
        wx.addCard({
          cardList: [],
          success: function (res) {
            callback && callback(res);
          }
        })
      }
    })
  }
}