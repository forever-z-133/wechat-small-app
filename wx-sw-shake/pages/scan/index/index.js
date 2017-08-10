// index.js
Page({
  data: {
    user: {
      img: '',
      isNight: false,
      nowSwiper: 0,
      progress: 0,
      maps: [],
    }
  },
  onLoad: function (options) {

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
  showRule: function () { },
  scan: function () { },
  share: function () { },
  swiperChange: function () { },
})