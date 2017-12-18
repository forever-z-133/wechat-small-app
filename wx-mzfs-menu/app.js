//app.js
App({
  onLaunch: function () {
    // 是否已获得用户信息
    wx.getSetting({
      success: settings => {
        this.globalData.noUser = settings.authSetting['scope.userInfo']
      }
    })
    // 登录与授权
    this.login(code => {
      this.getInfo(res => {
        // console.log(code)
        // console.log(res.encryptedData)
        // console.log(res.iv)
        // console.log(res.rawData)
        // console.log(res.signature)
        // console.log(res.userInfo)
        if (this.afterLogin) {
          this.afterLogin(res);
        }
      })
    })
  },
  // 登录
  login: function (callback) {
    wx.login({
      success: res => {
        console.log('登录', res)
        this.globalData.code = res.code
        callback && callback(res.code);
      }
    })
  },
  getInfo: function (callbcak) {
    wx.getUserInfo({
      lang: 'zh_CN',
      withCredentials: true,
      success: res => {
        console.log('用户信息', res.userInfo)
        // 可以将 res 发送给后台解码出 unionId
        this.globalData.userInfo = res.userInfo
        callbcak && callbcak(res)
      }
    })
  },
  getWindow: function(callback){
    if (this.globalData.window) {
      callback && callback(this.globalData.window)
    } else {
      wx.getSystemInfo({
        success: res => {
          console.log('设备信息', res)
          callback && callback(res)
        }
      })
    }
  },
  footer: function(e) {
    var arr = ['/pages/clock/index/index', '/pages/recipe/index/index', '/pages/mine/index/index']
    var index = e.currentTarget.dataset.index;
    console.log(index, this.history)
    var target = arr[index];
    // if (this.history == undefined) this.history = index;
    if (this.history == index) return;
    // if (this.history == target) {
    //   wx.navigateBack({
    //     success: r => {
    //       this.history = target;
    //     }
    //   }); return;
    // }
    wx.reLaunch({
      url: target,
      success: r => {
        this.history = index;
      }
    })
  },
  share: function() {
    return {
      title: 'xxx',
      path: '/pages/clock/index/index',
    }
  },
  scroll: function (e, that) {
    var st = e.scrollTop;
    if (this.lastY == undefined) this.lastY = st;
    if (st > this.lastY) { // 向下滑
      that.data.footer == 'menus' && that.setData({ footer: 'upload' });
    } else {
      that.data.footer == 'upload' && that.setData({ footer: 'menus' });
    }
    this.lastY = st;
  },
  defaultImg: [
    { img: '/img/temp/3.png', text: '内容内容内容内容内容内容内容内容内容' },
    { img: '/img/temp/2.png', text: '内容内容内容内容内容' },
    { img: '/img/temp/1.png', text: '内内容内容内容' },
    { img: '/img/temp/4.png', text: '内容内内容内容内容内容内容' },
    { img: '/img/temp/5.png', text: '内容内容内容内容内容内内容内容内容内容内容内容' },
  ],
  globalData: {
    window: null,
    code: null,
    userInfo: null,
    noUser: false,
  }
})