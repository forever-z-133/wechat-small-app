// index.js
var baseUrl = 'https://sum.kdcer.com/test/img/scan/';
var apiUrl = 'https://sum.kdcer.com/api/swShop/';
var app = new getApp();
var id = app.globalData.id;
var cl = '';
var isNight = null;

Page({
  data: {
    modal: {
      rule: false,
      detail: false,
      justify: false,
      prize: false,
      good: false,
      bad: false,
    },
    baseUrl: baseUrl,
    isNight: false,
    nowSwiper: 0,
    progress: 0,
    maps: [[0, 2, 3, 2, 1, 5, 6, 7, 8, 9], [0], [0]],
    prize: [[10, false], [20, false], [30, false]],
    code_question: '',
    code_answers: [],
    user: {},
  },
  onLoad: function (opt) {
    this.data.modal = {
      rule: false,
      detail: false,
      justify: false,
      prize: false,
      good: false,
      bad: false,
    }

    app.Login(function (r, user) {
      console.log(r, user)

      id = app.globalData.id;
      user.id = id.slice(-8);

      if (opt.cl) {
        cl = opt.cl
        this.data.modal.justify = true;
        this.getImgCode();
      }

      this.start();

      this.setData({
        user: user,
        modal: this.data.modal,
      });
    }.bind(this))
  },
  start: function () {
    wx.request({
      url: apiUrl + 'GetChannelList',
      data: {
        Unionid: id
      },
      success: function (r) {
        console.log('列表', r);
      },
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
  share: function () {
    wx.showShareMenu({
      withShareTicket: true
    });
  },
  onShareAppMessage: function () {
    if (this.data.nowSwiper == 0) {
      return {
        title: '玩转购物地吃吃吃吃吃吃吃吃吃吃吃吃吃吃吃吃吃吃吃吃',
        path: 'pages/index/index?type=0',
      }
    } else if (this.data.nowSwiper == 1) {
      return {
        title: '玩转购物地玩玩玩玩玩玩玩玩玩玩玩玩玩玩玩玩玩玩玩玩',
        path: 'pages/index/index?type=1',
      }
    } else if (this.data.nowSwiper == 2) {
      return {
        title: '玩转购物地购购购购购购购购购购购购购购购购购购购购',
        path: 'pages/index/index?type=2',
      }
    } else if (this.data.modal.good) {
      return {
        title: '人品爆发！中奖了！',
        path: 'pages/index/index',
      }
    } else {
      return {
        title: '玩转购物地，转遍大上海',
        path: 'pages/index/index',
      }
    }
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
    if (this.data.isNight !== isNight) {
      wx.showModal({
        title: '操作',
        content: '',
      })
    }
    wx.scanCode({
      onlyFromCamera: true,
      success: function (res) {
        var cll = app.QueryString('cl', res.result);
        if (typeof cll == undefined) {
          wx.showModal({
            content: '该码无非活动所需参数，请找工作人员确认此码是否有效。',
          });
        } else {
          cl = cll;
          this.getImgCode();
          this.data.modal.justify = true;
          this.setData({ modal: this.data.modal });
        }
      }
    });
  },

  // ------------------- 轮播图
  swiperChange: function (e) {
    this.setData({
      nowSwiper: e.detail.current
    })
  },
  swiperTo: function (e) {
    var direction = parseInt(e.target.dataset.type, 10)
    var i = this.data.nowSwiper + direction;
    i = Math.max(0, Math.min(2, i));
    this.setData({
      nowSwiper: i
    })
  },

  // ------------------- 点击商家
  clickItem: function (e) {

  },

  // ------------------- 点击宝箱
  clickBox: function (e) {
    var isOpen = e.currentTarget.dataset.open;
    var i = e.currentTarget.dataset.index;
    if (!isOpen) {
      this.setData({

      })
    }
    console.log(isOpen, typeof isOpen)
  },

  // ------------------- 积满 10 个抽奖
  page_prize2: function () {

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
        formId: e.detail.formId,
      },
      success: function (r) {
        wx.hideLoading();
        console.log('抽奖', r.data);
      },
      error: function () {
        wx.hideLoading();
      },
    });
  },

  // ------------------- 签到和抽奖
  signUp: function (formId) {
    wx.showLoading({
      title: '签到登记中...',
      mask: true,
    });
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
          this.page_prize();
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
            content: tip,
            mask: true,
          });
          this.getImgCode();
          this.data.modal.justify = false;
          this.setData({ modal: this.data.modal });
        }
      }.bind(this),
      error: function () {
        wx.hideLoading();
        wx.showToast({
          title: '签到失败，请关闭页面重新尝试吧',
          duration: 2500,
          mask: true,
        });
      }.bind(this),
    });
  },
  page_prize: function () {
    this.data.modal.justify = false;
    this.data.modal.prize = true;
    this.setData({ modal: this.data.modal });
  },
  getPrize: function (e) {
    var that = this
    wx.showLoading({
      title: '奖品翻滚中...',
      mask: true,
    });
    wx.request({
      url: apiUrl + 'GetSignLotteryBehavior',
      data: {
        Unionid: id,
        cl: cl,
        formId: e.detail.formId,
      },
      success: function (r) {
        console.log('抽奖', r.data);
        wx.hideLoading();
        if (r.data.State) {
          that.good();
          this.setData({
            prize: r.data.Bonus,
          });
        } else {
          var tip = '';
          switch (r.data.ErrorMessage) {
            case 911: tip = '您没有签到，无法抽奖'; break;
            case 912: tip = '您在非正规时间端内抽奖，比如白天抽到了夜晚的奖品'; break;
            case 913: tip = '已超过当天抽奖次数'; break;
            case 897: tip = '验证码错误，'; break;
            case 898: tip = '系统错误'; break;
            case 899: tip = '身份错误'; break;
            case 900: tip = '您已中奖'; break;
            case 901: tip = '已超过抽奖次数'; break;
            case 902: tip = '奖品已发完'; break;
            case 903: tip = '中奖数量已达上限'; break;
            case 904: tip = '今天已中奖，明天再来'; break;
            case 999: tip = this.bad(); return;
          }
          wx.showModal({
            title: '抽奖失败',
            content: tip,
            mask: true,
          });
        }
      },
      error: function () {
        that.good();
        wx.hideLoading();
      },
    });
  },

  // ------------------- 中奖与未中奖
  good: function () {
    console.log('xx')
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
    this.data.modal.result = false;
    this.setData({ modal: this.data.modal });
  },
  bad: function () {
    this.data.modal.prize = false;
    this.data.modal.bad = true;
    this.setData({ modal: this.data.modal });
  },
  bad_ok: function () {
    this.data.modal.bad = false;
    this.setData({ modal: this.data.modal });
  },

  // ------------------- 图形验证
  answer: function (e) {
    var mine = e.target.dataset.item;
    var index = e.target.dataset.index;
    this.myAnswer = mine;
    var a = this.data.code_answers;
    // console.log(this.myAnswer, this.rightAnswer)
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
    var that = this;
    if (this.myAnswer == this.rightAnswer) { // 答对
      this.signUp();
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
        console.log('验证', r.data);
        var answer = that.outOrder(r.data.answerPic);
        that.rightAnswer = r.data.Right;
        that.setData({
          code_question: r.data.quest,
          code_answers: answer,
        });
      },
      error: function (err) {
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