//app.js
// var fundebug = require('./utils/fundebug.0.0.3.min.js')
// fundebug.apikey = "eb849e5aea686764790042d8ea72bf02c3bcb55aeba53e0a11640beb4bc19b57";
var apiUrl = 'https://sum.kdcer.com/api/OpenShop';
var testUrl = 'https://192.168.1.139/api/OpenShop';
var isTest = false;

var code = null;
var user = null;
var post_user = null;


App({
  globalData: {
    userInfo: null,
    main_data: null,
    id: '',
  },

  // 获取用户信息（废弃）
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
      });
    }
  },

  // 获取屏幕宽高
  getScreenInfo: function (cb) {
    var that = this
    if (this.globalData.window) {
      typeof cb == "function" && cb(this.globalData.window)
    } else {
      var res = wx.getSystemInfoSync()
      that.globalData.window = {
        width: res.windowWidth,
        height: res.windowHeight
      }
      typeof cb == "function" && cb(that.globalData.window)
    }
  },

  // 入口接口（包括传入身份与code，初始判断等）
  Login: function (cb) {
    var that = this
    wx.showLoading({
      title: 'loading...',
    });
    code = null;
    wx.login({
      success: function (r1) {
        // console.log('login:', r1);
        if (!r1.code) {
          wx.showModal({
            title: '系统错误：未获取到 code',
            content: JSON.stringify(r1),
          });
          return;
        }
        code = r1.code;
        wx.getUserInfo({
          lang: 'zh_CN',
          withCredentials: true,
          success: function (r2) {
            // console.log('getUserInfo', r2);
            that.globalData.user = r2.userInfo;
            that.globalData.userInfo = r2.userInfo;
            // console.log(r2)
            // console.log(r1.code);

            user = JSON.parse(r2.rawData);
            var userInfo = {
              Nickname: user.nickName,
              Gender: user.gender,
              City: user.city,
              Country: user.country,
              Province: user.province,
              Language: user.language,
              HeadImgUrl: user.avatarUrl,
            }
            post_user = JSON.stringify(userInfo)

            wx.request({
              url: (isTest ? testUrl : apiUrl ) + '/CodeToSession',
              data: {
                code: r1.code,
                iv: r2.iv,
                encryptedDataStr: r2.encryptedData,
                userJson: JSON.stringify(userInfo),
              },
              success: function (r3) {
                // console.log('/onLogin/', r3.data);
                that.globalData.id = r3.data.Unionid;
                typeof cb == "function" && cb(r3.data, user);
              },
              fail: function(err){
                wx.showToast({
                  title: '系统错误',
                  mask: true,
                  duration: 9999999,
                });
              },
            });
          },
          // fail: function() {
            // wx.hideLoading();
            // wx.showModal({
            //   title: '操作有误',
            //   content: '请务必开启授权！\n 微信底部菜单点击【发现】>【小程序】> 长按或左滑【玩转购物地】>【删除】，然后重新进入，允许微信授权。\n 我们不想失去你，你也不想失去十万份礼包吧。',
              // success: function(res) {
              //   wx.getUserInfo({
              //     lang: 'zh_CN',
              //     withCredentials: true,
              //     success: function (r2) {
              //       wx.showLoading({
              //         title: '',
              //         duration: 99999999,
              //       });
              //     },
              //   });
              //   // if (res.confirm) {
              //   // } else if (res.cancel) {
              //   // }
              // }
            // })
          // },
        });
      },
      fail: function () {
        wx.showLoading({
          title: '获取 code 失败，请联系工作人员',
          duration: 99999999,
        });
      },
    });
  },

  // 字符串寻找键值对
  QueryString: function (name, str) {
    var str = decodeURIComponent(str);
    var reg = new RegExp('(^|\\?|&)' + name + '=([^&]*)(&|$)');
    var r = str.match(reg);
    return r != null ? decodeURIComponent(r[2]) : null;
  },

  // 判断类型
  Type: function (obj) {
    var typeStr = Object.prototype.toString.call(obj).split(" ")[1];
    return typeStr.substr(0, typeStr.length - 1).toLowerCase();
  },

  // 时间字符串转时间
  convertTime: function (d) {
    return new Date(parseInt(d.replace("/Date(", "").replace(")/", ""), 10));
  }
})
