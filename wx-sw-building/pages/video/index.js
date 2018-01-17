var video = ''

Page({
  data: {
  
  },
  onLoad: function (options) {
    console.log(options)
    video = options.video
    this.setData({ video: video });
  },
  onShareAppMessage: function () {
    return {
      path: '/pages/index/index?video=' + video,
    }
  }
})