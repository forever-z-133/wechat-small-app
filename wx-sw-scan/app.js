//app.js
App({
  globalData: {
    userInfo: null
  },
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.getUserInfo({
        withCredentials: false,
        success: function (res) {
          that.globalData.userInfo = res.userInfo
          typeof cb == "function" && cb(that.globalData.userInfo)
        }
      })
    }
  },
  getMaps: function () {
    return wx.getStorageSync('maps');
  },
  setMaps: function (index) {
    var maps = wx.getStorageSync('maps');
    maps[index].active = true;
    wx.setStorageSync('maps', maps);
  },
  setChoice: function (index, prize) {
    var choice = wx.getStorageSync('choice');
    choice[index] = prize || true;
    wx.setStorageSync('choice', choice);
  },
  getChoice: function () {
    return wx.getStorageSync('choice');
  },
})
wx.clearStorageSync();

if (!wx.getStorageSync('choice')) {
  var choice = [false, false, false];
  wx.setStorageSync('choice', choice);
}

if (!wx.getStorageSync('maps')) {
  var maps = [
    {
      name: '浦东新区',
      active: false,
      activity: [
        { link: '#', image: 'https://sum.kdcer.com/test/wx-sw-scan/img/scan_btn_sm.png' },
        // { link: '#', image: 'https://sum.kdcer.com/test/wx-sw-scan/img/scan_btn.png' },
      ]
    }, {
      name: '静安区·普陀区',
      active: false
    }, {
      name: '徐汇区·闵行区',
      active: false
    }, {
      name: '长宁区·青浦区',
      active: false
    }, {
      name: '黄浦区',
      active: false
    }, {
      name: '杨浦区·虹口区',
      active: false
    }, {
      name: '奕欧来上海购物村',
      active: false
    }, {
      name: '光明食品集团·全家便利店·多样屋',
      active: false
    }, {
      name: '百联集团',
      active: false
    }, {
      name: '苏宁易购·国美电器·永乐生活电器·东方购物',
      active: false
    }
  ];
  wx.setStorageSync('maps', maps);
}

wx.login({
  success: function (r) {
    console.log('login:', r);
    if (r.code) {
      wx.getUserInfo({
        withCredentials: true,
        success: function (res) {
          console.log('getUserInfo', res);
          wx.request({
            url: 'https://sum.kdcer.com/onLogin',
            data: {
              code: r.code,
              encryptedData: res.encryptedData,
              iv: res.iv,
              rawData: res.rawData,
              signature: res.signature
            }
          })
        }
      })
    } else {
      console.log('获取用户登录态失败！' + r.errMsg)
    }
  }
});