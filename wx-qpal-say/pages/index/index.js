
const app = getApp();
let userId = null;
import post from '../ajax.js';

let audio = wx.createInnerAudioContext()
let record = wx.getRecorderManager()
let recordOption = {
  duration: 10000,//指定录音的时长，单位 ms 
  sampleRate: 16000,//采样率 
  numberOfChannels: 1,//录音通道数 
  encodeBitRate: 96000,//编码码率 
  format: 'mp3',//音频格式，有效值 aac/mp3 
  frameSize: 50,//指定帧大小，单位 KB
}

Page({
  onShareAppMessage: app.share,
  onPullDownRefresh: function() {
    this.refresh();
  },
  data: {
    imgUrl: 'https://sum.kdcer.com/test/wx-qpal-say/',
    page: {
      welcome: false,
      rule: false,
      main: false,
      get: false,
      good: false,
      bad: false,
      gameover: false,
    },
    list: { data: [], state: 'load' },
    question: '题目'.repeat(Math.random()*20>>0),
  },
  onLoad: function () {
    app.entry_finish(res => {
      userId = res.userId;
      this.data.page.welcome = true;
      this.setData({ page: this.data.page, user: res.userInfo });

      this.reload_list();

      // audio.play()
    });
  },


  // --------------------- 录音部分
  record: function (e) {
    this.setData({ recording: true })
    clearTimeout(this.Timer);
    this.Timer = setTimeout(() => {
      this.record_start = true;
      this.startRecordTime = e.timeStamp;
      this.startRecord();
    }, 100)
  },
  startRecord: function () {
    record.start(recordOption)
    record.onStop(res => {
      if (this.recordSuccess) {
        console.log('录音', res);
        this.record_finish(res);
      }
    })
  },
  // startRecord: function () {
  //   wx.startRecord({
  //     success: res => {
  //       this.recordFile = res.tempFilePath;
  //       if (this.recordSuccess) {
  //         console.log('录音', res);
  //         this.record_finish(res);
  //       }
  //     }
  //   })
  // },
  stop: function (e) {
    if (!this.record_start) {
      clearTimeout(this.Timer);
    }
    this.record_start = false;
    wx.stopRecord();
    record.stop();
    this.setData({ recording: false });
    if (e.timeStamp - this.startRecordTime < 1000) {
      wx.showToast({ title: '录音时间过短' });
      this.recordSuccess = false;
    } else { this.recordSuccess = true }
  },
  record_finish(res) {
    wx.showLoading({ title: '匹配判定中...', mask: true });
    wx.uploadFile({
      url: 'https://sum.kdcer.com/api/SouthGift/AccountList',
      filePath: res.tempFilePath,
      name: 'qpal',
      success: r => {
        wx.hideLoading()
        console.log(r)
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
      this.data.list.data.map(x => x.playing = false);
      item.playing = true;
      audio.stop();
      audio.src = item.audio;
      audio.play();
    }
    this.setData({ list: this.data.list });
  },


  // -------------------- 列表部分
  load_list() {
    if (this.list_loding) return;
    this.list_loding = true;
    setTimeout(() => {
      this.list_loding = false;
      var arr = this._create_list_data();
      var list = this.data.list;
      list.data.push(...arr);
      this.setData({ list: this.data.list });
    }, 300);
  },
  reload_list() {
    this.data.list.data = [];
    this.data.list.state = 'load';
    this.setData({ list: this.data.list });
    this.load_list();
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
  start: function () {
    this.data.page.rule = false;
    this.data.page.main = true;
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