// index.js
var baseUrl = 'https://sum.kdcer.com/test/img/scan/';
var apiUrl = 'https://sum.kdcer.com/api/OpenShop/'
var app = new getApp();
var id = app.globalData.id;
var cl = '';

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

      if (opt.cl) {
        cl = opt.cl
        this.data.modal.justify = true;
        this.getImgCode();
      }

      this.setData({
        user: user,
        modal: this.data.modal,
      });
    }.bind(this))
  },
  onShow: function () {

  },
  onPullDownRefresh: function () {

  },
  onShareAppMessage: function () {

  },
  DayOrNight: function () {
    this.setData({
      isNight: !this.data.isNight
    })
  },
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
  scan: function () { },
  share: function () { },

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
  page_prize2: function() {

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
  signUp: function(formId) {
    wx.showLoading({
      title: '签到登记中...',
      mask: true,
    });
    wx.request({
      url: apiUrl + 'GetSignUp',
      data: {
        Unionid: id,
      },
      success: function(r) {
        wx.hideLoading();
        console.log('签到', r.data);
        this.page_prize();
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
        wx.hideLoading();
        console.log('抽奖', r.data);
      },
      error: function () {
        wx.hideLoading();
      },
    });
  },

  // ------------------- 中奖与未中奖
  good: function() {
    this.data.modal.prize = false;
    this.data.modal.good = true;
    this.setData({ modal: this.data.modal });
  },
  bad: function () {
    this.data.modal.prize = false;
    this.data.modal.bad = true;
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
      url: apiUrl + 'GetRndCode',
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
        console.log(that.data)
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