//index.js
var app = getApp();

// 各种标量
var baseUrl = '../../img/';
var ctx = null;   // canvas 对象
var winW, winH; // 屏幕宽高

// 图片资源相关的
var imgTotal = 0; // 图片总数，用于判断加载是否完成
var imgBaseUrl = 'https://sum.kdcer.com/test/sw_shake4/';
var imgs = [[7, '.jpg'], [7, '.jpg'], [7, '.jpg'], [7, '.jpg'], [6, '.png']];
var resource = null;  // 图片总集，用于 canvas 绘制更方便获取

// 活动开始时间
var startDate = new Date(2017, 8, 8, 20, 0, 0);
// 抽奖停止时间
var endDate = new Date(2017, 8, 8, 21, 0, 0);

// Unionid
var id = '';
var formId = null;

// 初始回调
var main_start = null;

// 能否点击加速
var canClick = false;

// 音频集合
var audio = null;

// 兼容 requestAnimationFrame
if (typeof requestAnimationFrame == 'undefined') {
  var lastTime = 0;
  var requestAnimationFrame = function (callback) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
    var id = setTimeout(function () { callback(currTime + timeToCall); }, timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  };
}
if (typeof cancelAnimationFrame == 'undefined') {
  var cancelAnimationFrame = function (id) {
    clearTimeout(id);
  };
}

// 基础 data 数据，用于重置时比较方便
var _defaultData = {
  page: {
    load: true,
    welcome: false,
    rule: false,
    start: false,
    train: false,
    finish: false,
    justify: false,
    prize: false,
    good: false,
    bad: false,
    result: false,
    tip: false,
  },
  canStart: true,   // Go 按钮，开始游戏
  doorOpen: false,  // 开门动
  timecount: [0, 0, 0, 0, 0, 0],  // 倒计时
  beforeShake: false,   // Ready GO
  ready_go: 'Ready',
  code_question: '',    // 验证码问题
  code_answers: [{}, {}, {}, {}],     // 验证码答案
  baseUrl: baseUrl,     // 文件默认路径
  imgBaseUrl: imgBaseUrl,
  imgLoadProgress: 0,  // load-text
  left: 0,    // 剩余可玩次数
};

// -----------------------------
// --------------------  正式开始
var page = Page({
  data: _defaultData,
  onShareAppMessage: function () {
    return {
      title: '哦哟！2017上海购物节摇一摇超级福利来哉！',
      path: 'pages/index/index',
    }
  },
  onLoad: function () {
    // 获取屏幕宽高
    app.getScreenInfo(function (window) {
      winW = window.width;
      winH = window.height;
    });

    // 改变标题名称
    wx.setNavigationBarTitle({
      title: '全城摇一摇'
    });

    // 音频初始化
    audio = {
      bgm: wx.createAudioContext('bgm'),
      train: wx.createAudioContext('train'),
      ready: wx.createAudioContext('ready'),
      shake: wx.createAudioContext('shake'),
      good: wx.createAudioContext('good'),
      bad: wx.createAudioContext('bad'),
      result: wx.createAudioContext('result'),
    };
  },
  // 各种失败
  error: function (err) {
    wx.showModal({
      content: JSON.stringify(err),
    });
  },
  // 重置全局变量
  reset: function () {
    imgTotal = 0; // 图片总量
    for (var i in imgs) {
      imgTotal += imgs[i][0];
    }
    speed = 0;  // 火车速度
    item = 0;   // 当前帧
    shakeMax = 5;  // 要摇5次才出结果
    shakeTimer = null;  // 摇一摇停止时
    canClick = false;  // 判断能不能摇
    tick && tick.stop();  // 动画暂停
  },
  onShow: function () {
    var that = this;
    this.reset();

    this.setData(_defaultData);

    app.Login(function (r1, user) {
      console.log('入口判断', r1);
      wx.hideLoading(); // 初始化加载
      audio.bgm.play(); // 背景音乐

      if (app.debug) {
        if (resource) {  // 如果图片已加载，直接显示
          this.page_welcome();
        } else {
          this.needImage();
          main_start = this.page_welcome;
        }
        return;
      } else {
        wx.showModal({
          content: '非 debug 模式，活动已下线，无法预览。',
        });
      }
    }.bind(this));
  },
  // -------------------- 图片加载
  needImage: function () {
    resource = [[], [], [], [], []];
    this.load(0, 0);
  },
  load: function (i, j) {
    if (!imgs[i]) return;
    this.count = this.count ? ++this.count : 1;
    if (j < imgs[i][0]) {
      var url = imgBaseUrl;
      wx.downloadFile({
        url: url + i + '/' + j + imgs[i][1],
        success: function (res) {
          resource[i][j] = res.tempFilePath;
          var progress = parseInt(this.count / imgTotal * 100, 10)
          this.setData({
            imgLoadProgress: Math.min(progress, 100),
          });
          if (this.count >= imgTotal) {
            this.imgLoaded();
          }
          this.load(i, ++j);
        }.bind(this),
      });
    } else {
      this.load(++i, 0);
    }
  },
  imgLoaded: function () {
    main_start && main_start();
  },
  reload: function () {
    wx.reLaunch({
      url: '/pages/index/index',
    });
  },
  // ----------- 规则页
  showRule: function () {
    this.data.page.rule = true;
    this.setData({ page: this.data.page });
  },
  closeRule: function () {
    this.data.page.rule = false;
    this.setData({ page: this.data.page });
  },
  // ----------- 倒计时
  time: function (EndTime, nowTime) {
    var offset = EndTime - nowTime;
    if (offset > 0) {
      var d = new Date(offset);
      d = new Date(d.setHours(d.getHours() - 8));
      var r = [];
      var that = this;
      var T = setInterval(function () {
        d = new Date(d.setSeconds(d.getSeconds() - 1));
        r[0] = parseInt(d.getHours() / 10, 10);
        r[1] = parseInt(d.getHours() % 10, 10);
        r[2] = parseInt(d.getMinutes() / 10, 10);
        r[3] = parseInt(d.getMinutes() % 10, 10);
        r[4] = parseInt(d.getSeconds() / 10, 10);
        r[5] = parseInt(d.getSeconds() % 10, 10);
        if (d.getTime() > -1 * 8 * 60 * 60 * 1000) {
          that.setData({
            timecount: r
          });
        } else if (nowTime - (new Date(2017, 8, 8, 21, 0, 0).getTime()) < 0) {
          clearInterval(T);
          that.setData({
            canStart: true,
          });
        } else {
          clearInterval(T);
        }
      }, 1000);
    }
  },
  // ----------- 开始游戏
  start: function () {
    this.setData({
      doorOpen: true,
    });
    setTimeout(function () {
      this.page_start();
    }.bind(this), 1000);
  },
  // ----------- 答题，用以防止盗刷
  answer: function (e) {
    var index = e.target.dataset.index;
    var a = this.data.code_answers;
    this.myAnswer = 1+index || null;
    for (var i in a) {
      if (i == index) a[i].active = true;
      else a[i].active = false;
    }
    this.setData({
      code_answers: a,
    });
  },
  // ----------- 判断答题对错
  justify: function (e) {
    if (typeof this.myAnswer == 'undefined') {
      return wx.showModal({
        content: '选个答案再确定吧',
      });
    }
    if (app.debug) {
      formId = e.detail.formId;
      this.getPrize(e); return;
    }
  },
  getPrize: function (e) {
    wx.showLoading({
      title: '礼品准备中...',
      mask: true,
    });
    if (app.debug) {
      wx.hideLoading();
      if (Math.random() > 0.5) {
        this.page_prize();
      } else {
        this.page_bad(false);
      }
      return;
    }
  },

  // ---------------------------------- 显示页面
  page_welcome: function () {
    this.data.page.load = false;
    this.data.page.welcome = true;
    this.setData({
      page: this.data.page,
    });
  },
  page_start: function () {
    this.data.page.welcome = false;
    this.data.page.start = true;
    audio.bgm.pause();
    audio.ready.play();
    this.setData({
      ready_go: 'Ready',
      page: this.data.page
    });
    setTimeout(function () {
      this.setData({
        ready_go: 'GO',
      });
    }.bind(this), 1200);
    setTimeout(function () {
      canClick = true;
      this.startShake();
    }.bind(this), 2000);
  },
  page_train: function () {
    this.data.page.start = false;
    this.data.page.train = true;
    this.setData({
      page: this.data.page,
    });
    ctx = wx.createCanvasContext('imgs');
    tick = smooth(run, 100, true);
    audio.bgm.pause();
    audio.train.play();
  },
  page_finish: function () {
    audio.result.play();
    if (!app.debug) {
      // this.getImgCode();
      wx.showModal({
        content: '非 debug 模式，活动已下线，无法预览。',
      });
    }
    this.data.page.load = false;
    this.data.page.finish = true;
    this.setData({
      page: this.data.page,
    });
    setTimeout(function () {
      this.data.page.train = false;
      this.data.page.justify = true;
      this.setData({
        page: this.data.page,
      });
      if (app.debug) {
        wx.showModal({
          content: '四个小方块随便选个，假装有数字算术验证码。',
        });
      }
    }.bind(this), 1800);
  },
  page_prize: function () {
    this.data.page.justify = false;
    this.data.page.prize = true;
    this.setData({
      page: this.data.page,
    });
  },
  page_result: function () {
    audio.bad.pause();
    audio.good.pause();
    audio.result.pause();
    this.data.page.prize = false;
    this.data.page.result = true;
    this.setData({
      page: this.data.page,
    });
  },
  page_good: function () {
    audio.result.pause();
    audio.good.play();
    this.data.page.prize = false;
    this.data.page.good = true;
    this.setData({
      page: this.data.page,
    });
  },
  page_bad: function (re) {
    audio.result.pause();
    audio.bad.play();
    this.data.page.prize = false;
    this.data.page.bad = true;
    this.setData({
      left: Math.max(--this.data.left, 0),
      page: this.data.page,
      reload: re ? true : false,
    });
  },
  result_ok: function () {
    wx.showModal({
      title: '每位用户只能中奖一次哟',
      content: '请在领奖时间内前往领奖地点凭此二维码领取精美礼品。',
    });
  },


  // 图形验证码
  getImgCode: function () {
    var that = this;
    wx.request({
      url: 'https://sum.kdcer.com/api/OpenShop/GetRndCode',
      data: {
        Unionid: id,
      },
      success: function (r) {
        console.log(r)
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
        })
      }
    });
  },
  // 答案改为乱序
  outOrder: function (data) {
    var result = [], keys = [];
    for (var i in data) keys.push(i);
    keys = keys.sort(function () { return Math.random() > 0.5 });
    for (var i in keys) {
      result.push({
        name: keys[i],
        url: data[keys[i]],
        active: false,
      });
    }
    return result;
  },
  // 开启摇一摇
  shakeTest: function () {
    if (!canClick) return;
    this.one();
  },
  startShake: function () {
    this.shake = Shake(function () {
      if (!canClick) return;
      this.one();
    }.bind(this), 50, 200);
  },
  stopShake: function () {
    this.shake && this.shake.stop();
    wx.stopAccelerometer();
  },

  // 摇地铁效果
  one: function () {
    if (!this.data.page.train) {
      this.page_train(); return;
    }
    shakeMax--;
    audio.shake.pause();
    audio.shake.seek(0);
    audio.shake.play();
    if (shakeMax > 0) {
      speed = Math.min(2, ++speed);
      tick.stop();
      tick = smooth(run, (2 - speed) * 50, true);
    } else if (shakeMax == 0) {
      tick.stop();
      tick = smooth(this.end1, 50, true);
    }
    clearInterval(shakeTimer);
    shakeTimer = setInterval(function () {
      speed = Math.max(0, --speed);
    }, 500);
    this.setData({ page: this.data.page });
  },
  end1: function () {
    this.stopShake();
    clearInterval(shakeTimer);
    canClick = false;
    if (item < imgs[speed][0]) {
      if (++item <= imgs[speed][0] - 1) {
        Draw(resource[speed][item]);
      } else {
        speed = 3;
        item = 0;
        tick.stop();
        tick = smooth(run, 50, imgs[speed][0] - 1, this.finish);
      }
    }
  },
  finish: function () {
    canClick = false;
    // audio.bgm.volume = 0;
    audio.train.pause();
    speed = 4;
    item = 0;
    tick = smooth(function () {
      speed = 4;
      run('fire')
    }, 200, true);
    this.page_finish();
  },
});

// 节流函数
var tId = null;
function throttle(method, context) {
  tId && clearTimeout(tId);
  tId = setTimeout(function () {
    method.call(context);
  }, 200);
}

// 每摇一次的交互
var shakeMax = 5;
var shakeTimer = null;

// 每个动画帧的运算
var speed = 0, item = 0;
var tick = null;
function run(e) {
  if (speed < 0) { Draw(resource[0][0]); return; }
  if (++item > imgs[speed][0] - 1) item = 0;
  Draw(resource[speed][item], typeof e === 'string');
}

// 绘制一张图片
function Draw(img, specail) {
  if (!img) return;
  if (!ctx) return;
  ctx.clearRect(0, 0, winW, winH);
  if (!specail) {
    ctx.drawImage(img, 0, 0, winW, winH);
  } else {
    ctx.drawImage(img, 0, -100, winW, winH);
  }
  ctx.draw();
}

function Shake(fn, sensitive, timeGap) {
  var lastTime = new Date();
  var lastX = null, lastY = null, lastZ = null;
  var sensitive = sensitive || 80;
  var timeGap = timeGap || 200;
  var isActive = true;
  wx.onAccelerometerChange(function (res) {
    if (!isActive) return;
    // res = res.accelerationIncludingGravity;
    var currentTime;
    var timeDifference;
    var deltaX = 0, deltaY = 0, deltaZ = 0;
    if ((lastX === null) && (lastY === null) && (lastZ === null)) {
      lastX = res.x; lastY = res.y; lastZ = res.z; return;
    }
    deltaX = Math.abs(lastX - res.x) * 100;
    deltaY = Math.abs(lastY - res.y) * 100;
    deltaZ = Math.abs(lastZ - res.z) * 100;
    if (((deltaX > sensitive) && (deltaY > sensitive)) ||
      ((deltaX > sensitive) && (deltaZ > sensitive)) ||
      ((deltaY > sensitive) && (deltaZ > sensitive))) {
      currentTime = new Date();
      timeDifference = currentTime.getTime() - lastTime.getTime();

      if (timeDifference > timeGap) {
        fn && fn(timeDifference);
        lastTime = new Date();
      }
    }
    lastX = res.x; lastY = res.y; lastZ = res.z;
  });
  return {
    stop: function () {
      isActive = false;
    }
  }
}

// 区间内持续时间的变化
function smooth(fn, duration, option, finish) {
  var type, per, now = Date.now(), Timer, count = 0, playing = true;

  var _optionType = app.Type(option);
  if (_optionType === 'boolean') { // 循环模式
    type = 'infinite';
    duration = duration || 25;
  } else if (_optionType === 'number') { // 限定次数
    type = 'remain';
    duration = duration || 25;
    var remain = option;
  } else {    // 运行一次，但 duration 期间按设备性能持续运行 fn
    type = 'animate';
    duration = duration || 1000;
    if (option) finish = option;
  }

  _run();
  function _run() {
    if (!playing) { cancelAnimationFrame(Timer); return; }
    per = Math.min(1, (Date.now() - now) / duration);
    if (per < 1) {
      if (type === 'animate') fn(per, ++count);
      Timer = requestAnimationFrame(_run);
    } else {
      if (type === 'animate' && finish) finish();
      if (type === 'infinite' || count < remain) {
        now = Date.now();
        fn(++count);
        if (count === remain && finish) finish()
        Timer = requestAnimationFrame(_run);
      } else {
        cancelAnimationFrame(Timer);
      }
    }
  }

  return {
    stop: function () {
      playing = false;
      cancelAnimationFrame(Timer);
    }
  }
}