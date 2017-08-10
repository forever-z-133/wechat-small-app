// index.js
Page({
  data: {
    isNight: false,
    rule_show: false,
    nowSwiper: 0,
    progress: 0,
    maps: [[0, 2, 3, 2, 1, 5, 6, 7, 8, 9], [0], [0]],
    prize: [[10, false], [20, false], [30, false]],
    user: {
      img: '',
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
  showRule: function () {
    this.setData({
      rule_show: true
    })
  },
  closeRule: function () {
    this.setData({
      rule_show: false
    })
  },
  scan: function () { },
  share: function () { },
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
  clickItem: function(e) {

  },
  clickBox: function(e) {
    var isOpen = e.currentTarget.dataset.open;
    var i = e.currentTarget.dataset.index;
    if (!isOpen) {
      this.setData({

      })
    }
    console.log(isOpen, typeof isOpen)
  },
})