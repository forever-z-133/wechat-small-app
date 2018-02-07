
const app = getApp();
let userId = null;
let screenId = null;
let questionId = null;
let user = null;
import post from '../ajax.js';

let audio = wx.createInnerAudioContext()
// audio.loop = true;
audio.obeyMuteSwitch = false;
let record = wx.getRecorderManager()
let recordOption = {
  duration: 10000,//指定录音的时长，单位 ms 
  sampleRate: 16000,//采样率 
  numberOfChannels: 1,//录音通道数 
  encodeBitRate: 96000,//编码码率 
  format: 'acc',//音频格式，有效值 aac/mp3 
  frameSize: 50,//指定帧大小，单位 KB
}

let default_page = {
  welcome: false,
  rule: false,
  main: false,
  get: false,
  get_ok: false,
  good: false,
  bad: false,
  gameover: false,
};

Page({
  prevent: function() { return false },
  onShareAppMessage: app.share,
  onPullDownRefresh: function() {
    this.refresh();
  },
  data: {
    imgUrl: 'https://sum.kdcer.com/test/wx-qpal-say/',
    page: Object.assign({}, default_page),
    list: { data: [], state: 'none' },
    question: '题目'.repeat(Math.random()*20>>0),
  },
  onLoad: function () {
    // this.data.page = Object.assign({}, default_page);
    // this.setData({ page: this.data.page });

    this.loginTimer = setTimeout(() => {
      this.main_entry();
    }, 5000)

    this.main_entry();
    this.bgm();
  },
  main_entry: function () {
    wx.showLoading({ title: 'loading...', mask: true });
    app.entry(res => {
      clearInterval(this.loginTimer);
      this.user = res.userInfo;
      post.entry(res.code, res.userData, r => {
        if (!r.State) {
          wx.showModal({
            title: '系统错误',
            content: r.Message || r.errMsg || r.Msg || '',
          }); return;
        }
        this.userId = r.UserInfo.UserGuid;
        this.screenId = r.Event.ThisScreen.ScreeningId;

        this.data.page.welcome = true;
        this.setData({
          user: res.userInfo,
          page: this.data.page,
        });

        this.main(r);

        this.game_start();
      })
    });
  },
  // 入口时的各种判断
  main: function(r) {
    if (!r.State && r.Message) {
      wx.showModal({
        title: '系统错误',
        content: r.Message,
      }); return;
    }

    this.setData({
      price: r.UserInfo.Amount,
      disable: r.IsSuccess,  // 是否中过奖
    })
  },

  game_start: function(callback) {
    post.begin(this.userId, this.screenId, res => {
      if (!res.State) {
        wx.showModal({
          title: '系统错误',
          content: r.Messgae,
        }); return;
      }

      wx.hideLoading()

      this.questionId = res.ScreenDetailId
      res.GiftList && this.reload_list(res.GiftList);

      this.setData({ list: this.data.list })

      this.setData({
        question: res.ShowContent,
      })

      callback && callback(res);
    })
  },

  // --------------------- 提现部分
  all_price: function() {
    this.setData({ myPrice: this.data.price });
  },
  input: function (e) {
    var val = e.detail.value * 100 + '';

    if (/(\d+)|(\d+\.\d+)|(\.\d+)/.test(val)) {
      this.lastInput = val;
    } else {
      // wx.showToast({ title: '慢点输，别急嘛', duration: 800 });
      this.setData({ myPrice: this.lastInput || 0 });
    }
    
    if (val > this.data.price) {
      this.setData({ myPrice: this.data.price });
    }
  },
  getMoney: function(e) {
    var price = e.detail.value.price;
    price = parseFloat(price) * 100 >> 0;
    console.log('提现金额', price)
    if (price == '' || price <= 0) {
      wx.showModal({
        content: '请输入点数量吧',
        showCancel: false,
      }); return;
    }
    wx.showLoading({ mask: true });
    // if (!this.posting) return
    // this.posting = true;
    post.getMoney(this.userId, price, res => {
      wx.hideLoading();
      if (!res.State) {
        wx.showModal({
          title: '提现失败',
          content: res.Message,
          showCancel: false,
        }); return;
      }
      this.voice('good');
      this.data.page.good = false;
      // this.data.page.get = false;
      this.data.page.get_ok = true;
      // wx.showToast({ title: '提现成功', icon: 'success' });
      this.setData({ page: this.data.page, myPrice: 0, price: res.TotalAmount });
    })
  },


  // --------------------- 录音部分
  initRecord: function() {
    record.onStop(this.record_success);
    record.onError(this.record_error);
  },
  record_success: function (res) {
    if (this.recordSuccess) {
      console.log('录音', res);
      this.record_finish(res);
    }
  },
  record_error: function (err) {
    // 录音被禁用，以及其他报错
    if (this.recordError) return;
    this.recordError = err;
    this.record_start = false;
    if (/deny|denied/i.test(err.errMsg)) {
      this.stop();
      app.openSetting();
    } else {
      wx.showModal({
        title: '系统错误',
        content: '微信的录音功能好像出了些问题',
        showCancel: false,
      });
    }
  },
  record: function (e) {
    // 开始录音
    this.stopAllVoice();
    this.setData({ recording: true })
    clearTimeout(this.Timer);
    this.Timer = setTimeout(() => {
      this.record_start = true;
      this.startRecordTime = e.timeStamp;
      this.startRecord();
    }, 100)
  },
  startRecord: function () {
    this.recordError = null;
    // record.start(recordOption)
    wx.startRecord({
      success: this.record_success.bind(this),
      fail: this.record_error.bind(this),
    });
  },
  stop: function (e) {
    if (!this.record_start) {
      clearTimeout(this.Timer);
    }
    this.record_start = false;
    wx.stopRecord();
    // record.stop();
    this.setData({ recording: false });
    if (!e) return false;
    if (e && e.timeStamp - this.startRecordTime < 1000) {
      wx.showToast({ title: '录音时间过短', mask: true });
      this.recordSuccess = false;
    } else { this.recordSuccess = true }
  },
  record_finish(res) {
    wx.showLoading({ title: '匹配判定中...', mask: true });
    console.log(this.userId, this.screenId, this.questionId)
    wx.uploadFile({
      url: 'https://sum.kdcer.com/api/SouthGift/VerifyVoice',
      filePath: res.tempFilePath,
      formData: {
        UserGuid: this.userId,
        screenId: this.screenId + '',
        ScreenDetailId: this.questionId + '',
        Event: 'QingPu',
      },
      name: "Voice",
      complete: r => {
        wx.hideLoading()
        r = JSON.parse(r.data);
        console.log('验证语音', r);
        if (r.State && r.Checked) {
          this.data.page.good = true;
          // this.onLoad();
          this.data.list.data.unshift(function(user){
            var x = {};
            console.log(user)
            x.name = user.nickName;
            x.img = user.avatarUrl;
            x.playing = false;
            x.second = 0;
            x.male = user.gender;
            x.audio = r.VoiceUrl;
            x.money = money(r.TotalAmount / 100);
            return x;
          }(this.user))
          this.setData({
            price: r.TotalAmount,
            list: this.data.list,
            disable: true,
            thisPrice: money(r.Amount/100),
            page: this.data.page,
            good_word: r.Message
          });
          this.voice('good');
        } else if (!r.Checked) {
          this.data.page.bad = true;
          this.setData({
            page: this.data.page,
            bad_word: r.Message
          })
          // this.voice('bad');
        } else if (!r.State) {
          wx.showModal({
            title: '系统错误',
            content: r.Message,
          })
        }
      }
    })
  },

  // --------------------- 播放历史音频部分
  playRecord: function(e) {
    var i = e.currentTarget.dataset.index;
    var item = this.data.list.data[i];
    if (item.playing) {
      item.playing = false;
      audio.stop();
    } else {
      this.data.list.data.map(x => {
        x.playing = false;
      });
      item.playing = true;
      audio.stop();
      audio.src = item.audio;
      audio.play();
    }

    audio.onEnded(res => {
      this.stopAllVoice();
    })
    
    this.setData({ list: this.data.list });
  },
  stopAllVoice() {
    this.data.list.data.map(x => {
      x.playing = false;
      return x;
    });
    audio.stop();
    this.setData({ list: this.data.list });
  },


  // -------------------- 列表部分
  convert_list: function(r) {
    return r.map(x => {
      x.name = x.UserInfo.NickName;
      x.img = x.UserInfo.HeadImgUrl;
      x.playing = false;
      x.second = 0;
      x.male = x.UserInfo.Gender;
      x.audio = x.VoiceUrl;
      x.money = money(x.Amount/100);
      return x;
    });
  },
  load_list(r) {
    // var arr = this._create_list_data();
    var arr = r;
    arr = this.convert_list(arr);
    var list = this.data.list;
    console.log(arr)
    list.data.push(...arr);
    list.state = 'empty';
    this.setData({ list: this.data.list });
    // if (this.list_loding) return;
    // this.list_loding = true;
    // setTimeout(() => {
    //   this.list_loding = false;
    //   var arr = r != undefined ? r : this._create_list_data();
    //   arr = this.convert_list(arr);
    //   var list = this.data.list;
    //   if (arr.length < 1) list.state = 'empty';
    //   list.data.push(...arr);
    //   this.setData({ list: this.data.list });
    // }, 300);
  },
  reload_list(r) {
    this.data.list.data = [];
    this.data.list.state = 'load';
    this.setData({ list: this.data.list });
    this.load_list(r);
  },
  _create_list_data() {
    return new Array(6).fill().map((x, i) => {
      return {
        name: '昵称'.repeat(Math.random() * 10 >> 0),
        money: money(Math.random() * 10),
        male: Math.random() * 2 >> 0,
        playing: false,
        second: Math.random() * 60 >> 0,
        audio: this.data.imgUrl + (Math.random() * 3 >> 0) + '.mp3',
      }
    });
  },


  // -------------------- 界面显隐部分
  page_start: function () {
    this.data.page.rule = false;
    this.data.page.welcome = false;
    this.data.page.main = true;
    audio.stop();
    audio.loop = false;
    this.setData({ page: this.data.page });
  },
  showRule: function () {
    this.data.page.rule = true;
    this.setData({ page: this.data.page });
  },
  hideRule: function () {
    this.data.page.rule = false;
    this.setData({ page: this.data.page });
  },
  page_get: function () {
    this.data.page.get = true;
    this.setData({ page: this.data.page });
  },
  page_bad: function () {
    this.data.page.bad = true;
    this.setData({ page: this.data.page });
  },
  page_welcome: function () {
    this.data.page.main = false;
    this.data.page.welcome = true;
    this.bgm()
    this.setData({ page: this.data.page });
  },
  close_bad: function () {
    this.data.page.bad = false;
    this.setData({ page: this.data.page });
  },
  cancel: function() {
    this.data.page.get = false;
    this.data.page.good = false;
    this.setData({ page: this.data.page });
  },
  close_ok: function () {
    this.data.page.get = false;
    this.data.page.get_ok = false;
    this.setData({ page: this.data.page });
  },
  bgm: function(){
    audio.stop();
    audio.loop = true;
    audio.src = this.data.imgUrl + 'bgm.mp3';
    audio.play();
  },
  voice: function (type) {
    audio.stop();
    audio.src = this.data.imgUrl + type + '.mp3';
    audio.play();
  },
})


// -----------------------------------
// ------------------ 其他公共方法 ----
// -----------------------------------




function money(nums) {
  return '￥' + nums.toFixed(2);
}

function moneys(...nums) {
  let all = nums.reduce((re, x) => re.concat([x]), [])
  let max = Math.max.apply(Math, all);
  let min = Math.min.apply(Math, all);
  return min == max ? money(min) : money(min) + '-' + money(max);
}