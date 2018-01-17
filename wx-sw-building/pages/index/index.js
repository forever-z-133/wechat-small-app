var baseUrl = 'https://sum.kdcer.com/sw-vote-1224/';
var data = [
  {
    image: 'bobh.jpg',
    video: 'bobh2.mp4',
  },
  {
    image: 'dsdgc.jpg',
    video: 'dsdgc2.mp4',
  },
  {
    image: 'dwbh.jpg',
    video: 'dwbh2.mp4',
  },
  {
    image: 'dybbb.jpg',
    video: 'dybbb2.mp4',
  },
  {
    image: 'gjzx.jpg',
    video: 'gjzx2.mp4',
  },
  {
    image: 'hl.jpg',
    video: 'hl2.mp4',
  },
  {
    image: 'hqg.jpg',
    video: 'hqg2.mp4',
  },
  {
    image: 'hzzx.jpg',
    video: 'hzzx2.mp4',
  },
  {
    image: 'jlzx.jpg',
    video: 'jlzx2.mp4',
  },
  {
    image: 'qbwk.jpg',
    video: 'qbwk2.mp4',
  },
  {
    image: 'xggc.jpg',
    video: 'xggc2.mp4',
  },
  {
    image: 'xtd.jpg',
    video: 'xtd2.mp4',
  },
  {
    image: 'xytgh.jpg',
    video: 'xytgh2.mp4',
  },
  {
    image: 'yf.jpg',
    video: 'yf2.mp4',
  }, 
]

Page({
  data: {
    list: []
  },
  onLoad: function (options) {
    var list = data.map(x => {
      return {
        image: baseUrl + 'img/' + x.image,
        video: baseUrl + 'video/' + x.video,
      }
    });
    this.setData({ list: list });

    // 可能需要跳详情
    let video = options.video
    if (video) {
      wx.navigateTo({
        url: '/pages/video/index?video=' + video,
      })
    }
  },
  onShareAppMessage: function () {
    return {
      path: '/pages/index/index',
    }
  }
})