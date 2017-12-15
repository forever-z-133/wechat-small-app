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
  notice: function (sid, uid, formId, callback) {
    wx.request({
      url: baseUrl + 'SubscribeSeckill',
      data: {
        UnionId: uid,
        ScreeningId: sid,
        FormId: formId,
      },
      success: function (r) {
        console.log('预约', r.data);
        callback && callback(r.data);
      }
    })
  },
  //==============  请求 - 存 formId
  save: function (uid, formId, callback) {
    wx.request({
      url: baseUrl + 'FormSeckill',
      data: {
        UnionId: uid,
        FormId: formId,
      },
      success: function (r) {
        console.log('存 formId', r.data);
        callback && callback(r);
      }
    })
  },
  //==============  请求 - 抽奖
  prize: function (sid, uid, formId, callback) {
    wx.request({
      url: baseUrl + 'MerryChristmasLotteryBehavior',
      data: {
        UnionId: uid,
        ScreeningId: sid,
        FormId: formId,
      },
      success: function (r) {
        console.log('抽奖', r.data);
        // console.log(callback)
        callback && callback(r.data);
      }
    })
  },
  //==============  请求 - 添加到卡包
  card: function (uid, callback) {
    wx.request({
      url: baseUrl + 'AddCardSeckill',
      data: {
        UnionId: uid,
      },
      success: function (r) {
        console.log('接口-加入卡包', r.data);

        // var res = r.data
        // var temp = JSON.parse(res.cardExt)
        // var cardExt = {
        //   code: '',
        //   openid: '',
        //   timestamp: temp.timestamp,
        //   signature: temp.signature
        // }
        // cardExt = JSON.stringify(cardExt)
        // cardExt = "'"+cardExt+"'";
        // console.log('cardExt', cardExt)

        wx.hideLoading()
        callback && callback();
        if (r.data.State == false) {
          wx.showModal({
            content: '您已添加过该卡券',
            showCancel: false,
          })
          return;
        } else if (r.data.State == true) {
          wx.addCard({
            cardList: [{
              cardId: 'pn96buA0KhY6XtFT4rRGCaLfWTGg',
              cardExt: r.data.cardExt,
              // cardExt: "'" + JSON.stringify(r.data.cardExt) + "'",
              // cardExt: cardExt,
            }],
            success: function (res) {
              console.log('微信-加入卡包', res);
            },
            fail: function(err) {
              console.log('微信-加入卡包-错误', err);
            }
          })
        } else {
          wx.showToast({
            title: '系统错误',
          })
        }
      }
    })
  }
}