//index.js
//获取应用实例
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    videoPlaying: false,
  },
  onReady: function() {
    this.video = wx.createVideoContext('indexVideo');
  },
  onLoad: function () {
    this.getQrcode();
  },
  // onShareAppMessage: function () {
  //   return {
  //     title: '上海购物节点亮地图',
  //     path: '/pages/index/index',
  //     fail: function () {
  //       wx.showToast({
  //         title: '转发失败',
  //         icon: 'cancel',
  //         duration: 1000
  //       })
  //     }
  //   }
  // },

  // 播放视频
  videoPlay: function () {
    // this.videoClick = true;
    // if (!this.videoOnce) {
      this.video.play();
      // this.videoOnce = true;
      this.setData({
        videoPlaying: true,
      });
    // }
  },
  videoPlay2: function (e) {
    // if (!this.videoClick) return;
    // if (e.detail.currentTime > 0 && !this.data.videoPlaying) {
    //   this.setData({
    //     videoPlaying: true,
    //   });
    // }
  },
  videoEnd: function () {
    this.setData({
      videoPlaying: false,
    });
    this.video.pause();
    setTimeout(function () {
      wx.redirectTo({
        url: '../map/map',
        success: function (e) {
          console.log(e)
        }
      })
    }, 400);
  },
  getQrcode: function(){
    // wx.request({
    //   url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx4c9ff4f865d3d7b9&secret=b191c26b0cfe309d0fd394d704896778',
    //   success: function (e) {
        // console.log(e);
        // wx.request({
        //   url: 'https://api.weixin.qq.com/wxa/getwxacode?access_token=' + 'iGH5LaZXq5_hek2IB8_bAy4u1jvD_D7leovo0BBjWjrjzRyBe_98itqljt5hAYjFO71wdVQyWvV9S7ymoz2gMlfy5cncMVlbWqoaO8vX1qMgtaOCCB3SC7L_lH2pkwPgDACaADAZWY',
        //   data: {
        //     path: '/pages/prize/prize',
        //     width: 430,
        //   },
        //   success: function (res) {
        //     console.log(res);
        //   },
        //   fail: function (res) { },
        //   complete: function (res) { },
        // })
      // }
    // })
  },
})
