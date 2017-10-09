// pages/card/card.js
var app = getApp()
Page({
  data: {
    id: '00000001',
    info: {},
    maps: [],
    prize_tip: '',
    prize_able: false,
    ruleShow: false,
    coverHide: false,
  },
  onLoad: function (options) {
    // 用户数据
    var that = this
    app.getUserInfo(function (userInfo) {
      that.setData({
        info: userInfo,
        maps: app.getMaps() // 地图数据
      })
    })

    // 机会数据
    this.choice();
  },
  onReady: function () {
    // this.ctx = wx.createCanvasContext('prize');
    // this.ctx.setFillStyle('#cccccc');
    // this.ctx.fillRect(0, 0, 400, 90);
    // // this.ctx.clearRect(10, 10, 10, 10)
    // this.ctx.draw();


    wx.setTopBarText({
      text: 'hello, world!',
      success: function () {
        wx.showToast({
          title: '成功',
          icon: 'success',
          duration: 2000
        })
      },
      complete: function(e){
        console.log(e)
      }
    })
  },
  onShareAppMessage: function () {
    return {
      title: '上海购物节点亮地图',
      path: '/pages/index/index',
    }
  },
  /* 查看我的活动奖励 */
  myPrize: function () {
    var prize = app.getChoice();
    var tips = '';
    for (var i in prize) {
      if (typeof prize[i] == 'string') {
        tips += prize[i] + '\n';
      }
    }
    var shakes = wx.getStorageSync('shake_prize');
    if (shakes) tips += shakes + '\n';
    if (tips.length > 0) {
      tips = '恭喜您已获得：\n' + tips;
    } else {
      tips = '您还未获得奖品，再接再厉'
    }
    wx.showModal({
      title: '提示',
      content: tips || '本活动尚未开始！',
    })
  },
  /* 开始刮奖 */
  startPrize: function () {
    var has = app.getChoice();
    var rdm = parseInt(Math.random() * 4, 10);
    var prize = ['礼品1', '礼品2', '礼品3', '礼品4'];
    var tips = '';
    var index = 0;
    for (var i in has) {
      if (has[i] === true) {index = i}
    }
    if (rdm < 1) {
      tips = '抱歉，您没有中奖';
      app.setChoice(index, false);
    } else {
      tips = '恭喜，您获得了' + prize[rdm];
      app.setChoice(index, prize[rdm]);
    }
    this.setData({
      coverHide: true,
      prize_result: tips,
    })
  },
  /* 刮奖完成重新开始 */
  restart: function() {
    this.choice();
  },
  /* 扫码 */
  scan: function () {
    wx.showModal({
    	content: '为了方便预览，所需的二维码为数字 1-10 对应的 10 个二维码，可通过草料等在线工具生成。',
    	complete: function() {
    		this._scan();
    	}.bind(this),
    });
  },
  _scan: function () {
    var that = this;
    wx.scanCode({
      onlyFromCamera: true,
      success: function (res) {
        /* 判断码的正误 */
        if (!/^\d{1,2}$/.test(res.result)) {
          wx.showModal({
            title: '提示',
            content: '您扫的码好像不对吧',
          });
          return false;
        }
        var index = parseInt(res.result, 10) - 1;
        var one = that.data.maps[index];
        /* 判断重复扫码 */
        if (one.active) {
          wx.showModal({
            title: '提示',
            content: '此区域您已点亮',
          });
          return false;
        }
        /* 成功点亮 */
        that.light(index);
        /* 判断抽奖 */
        that.choice();
      }
    });
  },
  /* 判断抽奖次数 */
  choice: function () {
    var tips = '';
    var count = 0;
    var able = false;
    var has = app.getChoice();
    /* 判断距离下次抽奖缺少数目 */
    for (var i in this.data.maps) {
      if (this.data.maps[i].active) { ++count; }
    }
    if (count < 0 || count > 10) {
      tips = '数据有误，请联系工作人员';
    } else if (count < 3) {
      tips += '还差' + (3 - count) + '次扫码获得更多机会！';
    } else if (count < 6) {
      if (count == 3 && !has[0]) { app.setChoice(0, true) }
      tips += '还差' + (6 - count) + '次扫码获得更多机会！';
    } else if (count < 10) {
      if (count == 6 && !has[1]) { app.setChoice(1, true) }
      tips += '还差' + (10 - count) + '次扫码获得更多机会！';
    } else if (count == 10) {
      if (!has[2]) { app.setChoice(2, true) }
      tips += '恭喜您点亮了所有地图！';
    }
    /* 判断剩余抽奖次数 */
    var choice = 0;
    has = app.getChoice();
    for (var i in has) {
      if (has[i] === true) {
        ++choice;
      }
    }
    tips = '您有' + choice + '次抽奖机会！' + tips;
    if (choice > 0) able = true;
    /* 修改提示文字 */
    this.setData({
      prize_tip: tips,
      prize_able: able,
      coverHide: false,
    })
  },
  /* 点亮 */
  light: function (index) {
    this.data.maps[index].active = true;
    app.setMaps(index);
    this.setData({
      maps: this.data.maps
    })
  },
  /* 显示规则 */
  rule: function () {
    this.setData({
      ruleShow: true,
    });
  },
  ruleHide: function () {
    this.setData({
      ruleShow: false,
    });
  },
})