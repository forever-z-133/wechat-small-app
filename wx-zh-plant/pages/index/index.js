
const app = getApp();
import post from '../ajax.js';

let audio = null;
if (typeof wx.createInnerAudioContext == 'function') {
  audio = wx.createInnerAudioContext()
}

let default_page = {
  welcome: false,
  good: false,
  bad: false,
};

Page({
  prevent: function() { return false },
  onShareAppMessage: app.share,
  onPullDownRefresh: function() {
    this.main();
  },
  data: {
    imgUrl: 'https://sum.kdcer.com/test/wx-zh-plant-0207/',
    page: Object.assign({}, default_page),
  },
  onLoad: function() {
    this.voice('bgm', true);

    this.loginTimer = setInterval(() => {
      console.log('login is not access')
      this.main();
    }, 5000);
  },
  onShow: function () {
    this.main();
  },
  // 入口时的各种判断
  main: function () {
    wx.showLoading({ title: 'loading...', mask: true });
    app.entry(res => {
      clearInterval(this.loginTimer)
      this.setData({ page: this.data.page });
      this.data.page.welcome = true;
      post.entry(res.code, res.userData, r => {
        wx.hideLoading()
        if (!r.State) {
          if (r.Bonus) {
            this.data.page.good = true;
            this.setData({
              prize: {
                name: r.Des + (r.Take ? "(已领取)" : ""),
                Address: r.Address,
                Tel: r.Tel,
                more: '请前往' + (r.Address || "百联中环") + '处凭手机号' + (r.Tel ? "("+r.Tel+")" : "")+'领取奖品',
                tips: '记得要在 ' + (r.Time || "2月14号10:00-21:00") + ' 领取奖品呦',
                qrcode: r.Bonus,
              },
              page: this.data.page
            }); return;
          }
          if (r.ErrorMessage) {
            wx.showModal({
              title: '系统错误',
              content: r.ErrorMessage,
            }); return;
          }
          this.data.page.bad = true;
          this.setData({ page: this.data.page });
        } else {
          this.userId = r.user.OpenId;
          this.data.page.welcome = true;
          this.setData({ page: this.data.page });
        }
      })
    });
  },

  // 提交
  submit: function(e) {
    var data = e.detail.value;
    var tel = data.phone;
    console.log(tel)
    if (!/1\d{10}/.test(tel)) {
      wx.showModal({
        content: '请输入正确的手机号码',
        showCancel: false,
      }); return;
    }
    wx.showLoading({ title: '奖品等等我~' });
    post.getPrize(this.userId, tel, r => {
      wx.hideLoading();
      if (r.State && r.Bonuses && r.Bonuses.length) {
        this.data.page.good = true;
        this.setData({
          page: this.data.page,
          playAnim: true,
          prize: {
            name: r.Bonuses[0].Des + (r.Bonuses[0].Take ? "(已领取)" : ""),
            Address: r.Bonuses[0].Address,
            Tel: r.Bonuses[0].Tel,
            more: '请前往' + (r.Bonuses[0].Address || "百联中环") + '处凭手机号' + (r.Bonuses[0].Tel ? "(" + r.Bonuses[0].Tel + ")":"") +'领取奖品',
            tips: '记得要在 ' + (r.Bonuses[0].Time || "2月14号10:00-21:00") + ' 领取奖品呦',
            qrcode: r.Bonuses[0].QRCode,
          }
        });
        this.voice('good');
      } else {
        if (r.BonusState == 902 && r.ErrorMessage) {
          wx.showModal({
            content: r.ErrorMessage,
            showCancel: false,
          });
        }
        this.data.page.bad = true;
        this.setData({
          page: this.data.page,
          playAnim: true,
        });
        this.voice('bad');
      }
    })
  },

  // 验证手机号
  input: function (e) {
    var val = e.detail.value;
  },

  // ------------------------------  播放音频
  voice: function (name, play) {
    if (!audio) return;
    audio.stop();
    audio.loop = false;
    if (!play) return;
    var imgUrl = this.data.imgUrl;
    audio.src = imgUrl + name + '.mp3';
    switch (name) {
      case 'bgm': audio.loop = true; break;
    }
    audio.play();
  }
})


// -----------------------------------
// ------------------ 其他公共方法 ----
// -----------------------------------
