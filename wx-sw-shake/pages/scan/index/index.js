// index.js
var baseUrl = 'https://sum.kdcer.com/test/img/scan/';
var apiUrl = 'https://sum.kdcer.com/api/swShop/';
var app = new getApp();
var id = app.globalData.id;
var cl = '';
var isNight = null;
var formId = null;
var main_data = null;

var shareArr = [
  {
    title: '玩转购物地吃吃吃吃吃吃吃吃吃吃吃吃吃吃吃吃吃吃吃吃',
    path: 'pages/index/index?type=0',
  }, {
    title: '玩转购物地玩玩玩玩玩玩玩玩玩玩玩玩玩玩玩玩玩玩玩玩',
    path: 'pages/index/index?type=1',
  }, {
    title: '玩转购物地购购购购购购购购购购购购购购购购购购购购',
    path: 'pages/index/index?type=2',
  }, {
    title: '人品爆发！中奖了！',
    path: 'pages/index/index',
  }, {
    title: '玩转购物地，转遍大上海',
    path: 'pages/index/index',
  }
];

Page({
  data: {
    modal: {
      rule: false,
      detail: false,
      justify: false,
      prize: false,
      good: false,
      bad: false,
      more: false,
      prize2: false,
    },
    baseUrl: baseUrl,
    isNight: false,
    nowSwiper: 0,
    progress: 0,
    maps_day: [[], [], []],
    maps_night: [[], [], []],
    prize: [10, 20, 30],
    prize_open: -1,
    code_question: '',
    code_answers: [],
    need_count: 10,
    user: {},
    bonus: null,
    modudu: [],
  },
  onLoad: function (opt) {
    app.Login(function (r, user) {
      console.log(r, user)

      id = app.globalData.id;

      if (opt.cl) {
        cl = opt.cl;
      }

      this.start();
    }.bind(this))
  },
  start: function () {
    wx.request({
      url: apiUrl + 'GetList',
      data: {
        Unionid: id
      },
      success: function (r) {
        console.log('列表', r.data);
        wx.hideLoading();
        main_data = r.data;

        if (!r.data.State) {
          wx.showToast({
            title: '可能系统出了问题',
            mask: true,
            duration: 99999,
          });
          return;
        }

        var user = app.globalData.user;
        user.id = r.data.UserPassCard;

        isNight = r.data.DayState;

        var day = [], night = [];
        for (var i in r.data.list) {
          var one = r.data.list[i];
          if (one.LotteryType == 0) {
            if (!day[one.PlayType]) day[one.PlayType] = [];
            day[one.PlayType].push(one);
          } else {
            if (!night[one.PlayType]) night[one.PlayType] = [];
            night[one.PlayType].push(one);
          }
        }
        
        if (r.data.GetCollectCount > 0) {
          this.data.modal.more = true;
        } else if (cl) {
          this.getImgCode();
          this.data.modal.justify = true;
        }

        var modudu = [];
        for (var i=1; i<=3; i++) {
          modudu.push(baseUrl + 'modudu' + i + 's.png');
        }

        this.setData({
          user: user,
          modal: this.data.modal,
          progress: r.data.count,
          need_count: 10 - r.data.count % 10,
          maps_day: day,
          maps_night: night,
          modudu: modudu,
        });
      }.bind(this),
      error: function (err) {
        wx.showToast({
          title: '系统出错了',
          mask: true,
          duration: 999999
        });
      },
    });
  },
  onShow: function () {

  },
  // ------------------- 分享
  onShareAppMessage: function () {
    var random = (Math.random() * 5) >> 0;
    return shareArr[random];
  },
  // ------------------- 切换白天黑夜
  DayOrNight: function () {
    this.setData({
      isNight: !this.data.isNight
    })
  },

  // ------------------- 规则页
  showRule: function (close) {
    this.data.modal.rule = true;
    this.setData({
      modal: this.data.modal,
    });
  },
  closeRule: function () {
    this.data.modal.rule = false;
    this.setData({
      modal: this.data.modal,
    });
  },

  // ------------------- 扫码
  scan: function () {
    var that = this;
    wx.scanCode({
      onlyFromCamera: true,
      success: function (res) {
        wx.hideLoading();
        var cll = app.QueryString('cl', res.result);
        // console.log(cll)
        if (typeof cll == undefined) {
          wx.showModal({
            content: '该码无非活动所需参数，请找工作人员确认此码是否有效。',
          });
        } else {
          cl = cll;
          wx.showLoading({
            title: '获取验证码...',
            mask: true,
          });
          this.getImgCode();
          this.data.modal.justify = true;
          this.setData({ modal: this.data.modal });
        }
      }.bind(this),
    });
  },

  // ------------------- 轮播图
  swiperChange: function (e) {
    this.setData({
      nowSwiper: e.detail.current
    })
    console.log(this.data.nowSwiper);
  },
  swiperTo: function (e) {
    var direction = parseInt(e.target.dataset.type, 10)
    var i = this.data.nowSwiper + direction;
    var max = this.data.isNight ? this.data.maps_day.length : this.data.maps_night.length;
    i = Math.max(0, Math.min(max, i));
    this.setData({
      nowSwiper: i
    })
  },

  // ------------------- 点击商家
  clickItem: function (e) {

  },

  // ------------------- 点击宝箱
  clickBox: function (e) {
    var i = e.currentTarget.dataset.index;
    var o = this.data.prize_open == i ? -1 : i;
    this.setData({ prize_open: o });
  },

  // ------------------- 积满 10 个抽奖
  page_prize2: function () {
    this.data.modal.justify = false;
    this.data.modal.more = false;
    this.data.modal.bad = false;
    this.data.modal.result = false;
    this.data.modal.prize2 = true;
    this.setData({ modal: this.data.modal });
  },
  getPrize2: function () {
    wx.showLoading({
      title: '你很棒棒哟...',
      mask: true,
    });
    wx.request({
      url: apiUrl + 'GetCollectLotteryBehavior',
      data: {
        Unionid: id,
        cl: cl,
        formId: formId,
      },
      success: function (r) {
        console.log('集签抽奖', r.data);
        wx.hideLoading();
        if (r.data.State) {
          cl = null;
          this.good();
          this.setData({
            bonus: r.data.Bonuses[0],
          });
        } else {
          var tip = '';
          switch (r.data.ErrorMessage) {
            case 911: tip = '您没有签到，无法抽奖'; break;
            case 912: tip = '您在非正规时间端内抽奖，比如白天抽到了夜晚的奖品'; break;
            case 913: tip = '已超过当天抽奖次数'; break;
            case 897: tip = '验证码错误，也可能是系统错误'; break;
            case 898: tip = '系统错误'; break;
            case 899: tip = '身份错误'; break;
            case 900: tip = '您已中奖'; this.good(); break;
            case 901: tip = '已超过抽奖次数'; break;
            case 902: tip = '奖品已发完'; break;
            case 903: tip = '中奖数量已达上限'; break;
            case 904: tip = '今天已中奖，明天可以再来'; break;
            case 998: tip = '您没有签够指定数目的购物地哟，请查看规则'; break;
            case 999: tip = '未中奖'; this.bad(); return;
          }
          wx.showModal({
            title: '抽奖失败',
            content: tip || '系统错误',
            mask: true,
          });
        }
        this.data.modal.more = false;
        this.data.modal.prize2 = false;
        this.setData({ modal: this.data.modal });
      }.bind(this),
      error: function () {
        wx.hideLoading();
      },
    });
  },

  // ------------------- 签到和抽奖
  click_get_prize: function (e) {
    formId = e.detail.formId;
    var t = e.target.dataset.type;
    if (t == 'collect') {
      this.getPrize2();
    } else {
      this.signUp();
    }
  },
  signUp: function () {
    wx.showLoading({
      title: '签到登记中...',
      mask: true,
    });
    this.data.modal.justify = false;
    // console.log(id, cl)
    wx.request({
      url: apiUrl + 'GetSignUp',
      data: {
        Unionid: id,
        cl: cl,
      },
      success: function (r) {
        console.log('签到', r.data);
        wx.hideLoading();
        if (r.data.State) {
          wx.showToast({
            title: '签到成功',
          });
          this.getPrize();

          var n = r.data.Sign.LotteryType;
          var i = r.data.Sign.PlayType;
          var d = n ? this.data.maps_night : this.data.maps_day;
          for (var s in d) {
            for (var j in d[s]) {
              if (r.data.Sign.Guid == d[s][j].Guid) {
                d[s][j].Light = true; break;
              }
            }
          }
          console.log('0为白天:' + n, '签到地的类:' + i);
          this.setData({
            isNight: n,
            nowSwiper: i,
            maps_night: this.data.maps_night,
            maps_day: this.data.maps_day,
            progress: Math.min(30, ++this.data.progress),
          });
        } else {
          var tip = '';
          switch (r.data.ErrorMessage) {
            case 905: tip = '没有此渠道二维码，请和工作人员确认此二维码是否有效'; break;
            case 906: tip = '这里您已经签到过了，去签其他地方吧'; break;
            case 907: tip = '签到活动尚未开始'; break;
            case 908: tip = '今天签到活动尚未开始'; break;
            case 909: tip = '今天签到活动结束了，请继续关注上海购物节的后续活动'; break;
          }
          wx.showModal({
            title: '签到失败',
            content: tip || '系统错误',
            mask: true,
          });
        }
        this.data.modal.prize = false;
        this.setData({ modal: this.data.modal });
      }.bind(this),
      error: function () {
        wx.hideLoading();
        wx.showToast({
          title: '签到失败，可能是系统问题，请关闭页面重新尝试吧',
          duration: 2500,
          mask: true,
        });
        this.data.modal.prize = false;
        this.setData({ modal: this.data.modal });
      }.bind(this),
    });
  },
  page_prize: function () {
    this.data.modal.justify = false;
    this.data.modal.more = false;
    this.data.modal.prize = true;
    this.setData({ modal: this.data.modal });
  },
  getPrize: function (e) {
    var that = this;
    wx.request({
      url: apiUrl + 'GetSignLotteryBehavior',
      data: {
        Unionid: id,
        cl: cl,
        formId: formId,
      },
      success: function (r) {
        console.log('抽奖', r.data);
        // wx.hideLoading();
        if (r.data.State) {
          cl = null;
          that.good();
          this.setData({
            bonus: r.data.Bonuses[0],
          });
        } else {
          var tip = '';
          switch (r.data.ErrorMessage) {
            case 911: tip = '您没有签到，无法抽奖'; break;
            case 912: tip = '您在非正规时间端内抽奖，比如白天抽到了夜晚的奖品'; break;
            case 913: tip = '已超过当天抽奖次数'; break;
            case 897: tip = '验证码错误，也可能是系统错误'; break;
            case 898: tip = '系统错误'; break;
            case 899: tip = '身份错误'; break;
            case 900: tip = '您已中奖'; this.good(); break;
            case 901: tip = '已超过抽奖次数'; break;
            case 902: tip = '奖品已发完'; break;
            case 903: tip = '中奖数量已达上限'; break;
            case 904: tip = '今天已中奖，明天可以再来'; break;
            case 999: tip = this.bad(); return;
          }
          wx.showModal({
            title: '抽奖失败',
            content: tip || '系统错误',
            mask: true,
          });
        }
        this.data.modal.prize = false;
        this.setData({ modal: this.data.modal });
      }.bind(this),
      error: function () {
        // wx.hideLoading();
        wx.showToast({
          title: '抽奖失败，可能是系统问题，请关闭页面重新尝试吧',
          duration: 2500,
          mask: true,
        });
        this.data.modal.prize = false;
        this.setData({ modal: this.data.modal });
      },
    });
  },

  // ------------------- 中奖与未中奖
  good: function () {
    this.data.modal.prize = false;
    this.data.modal.good = true;
    this.setData({ modal: this.data.modal });
  },
  result: function () {
    this.data.modal.good = false;
    this.data.modal.result = true;
    this.setData({ modal: this.data.modal });
  },
  result_ok: function () {
    if (this.data.progress && this.data.progress % 10 == 0) {
      this.data.modal.more = true;
    }
    this.data.modal.result = false;
    this.setData({ modal: this.data.modal });
  },
  bad: function () {
    this.data.modal.prize = false;
    this.data.modal.bad = true;
    this.setData({ modal: this.data.modal });
  },
  bad_ok: function () {
    if (this.data.progress && this.data.progress % 10 == 0) {
      this.data.modal.more = true;
    }
    this.data.modal.bad = false;
    this.setData({ modal: this.data.modal });
  },

  // ------------------- 图形验证
  answer: function (e) {
    var mine = e.target.dataset.item;
    var index = e.target.dataset.index;
    this.myAnswer = mine;
    var a = this.data.code_answers;
    for (var i in a) {
      if (i == index) a[i].active = true;
      else a[i].active = false;
    }
    this.setData({
      code_answers: a,
    });
  },
  justify: function (e) {
    if (typeof this.myAnswer == 'undefined') {
      return wx.showModal({
        content: '选个答案再确定吧',
        mask: true,
      });
    }
    // console.log(this.myAnswer, this.rightAnswer);
    var that = this;
    if (this.myAnswer == this.rightAnswer) { // 答对
      this.page_prize();
    } else {  // 答错
      this.getImgCode();
      wx.showModal({
        title: '回答错误',
        content: '再重新答一次吧',
        mask: true,
      });
    }
  },
  getImgCode: function () {
    var that = this;
    wx.request({
      url: 'https://sum.kdcer.com/api/OpenShop/GetRndCode',
      data: {
        Unionid: id,
      },
      success: function (r) {
        wx.hideLoading();
        console.log('验证', r.data);
        var answer = that.outOrder(r.data.answerPic);
        that.rightAnswer = r.data.Right;
        that.setData({
          code_question: r.data.quest,
          code_answers: answer,
        });
      },
      error: function (err) {
        wx.hideLoading();
        wx.showToast({
          title: '接口报错' + JSON.stringify(err),
          mask: true,
        });
      }
    });
  },
  outOrder: function (a) {
    var keys = [], result = [];
    for (var i in a) keys.push(i);
    keys = keys.sort(() => Math.random() > 0.5);
    for (var i in keys) {
      result.push({
        name: keys[i],
        url: a[keys[i]],
        active: false,
      });
    }
    return result;
  }
});