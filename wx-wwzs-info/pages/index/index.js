//index.js
var basePath = 'http://petwwzs.com/';
var gallery = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg'];
gallery = gallery.map(function (a) {
  return basePath + 'img/gallery/' + a;
});

Page({
  data: {
    basePath: basePath,
    gallery: gallery,
    showAll: false,
  },
  onLoad: function () {
    this.videoContext = wx.createVideoContext('myVideo')
    this.setData({ gallery: gallery });
  },
  preview: function(e) {
    var i = e.target.dataset.index
    wx.previewImage({
      current: i,
      urls: gallery,
      success: function(e){console.log(e)}
    });
  },
  map: function(){
    wx.openLocation({
      latitude: 30.6347400000,
      longitude: 114.1641600000,
    });
  },
  phone: function(){
    wx.makePhoneCall({
      phoneNumber: '13554530068' //仅为示例，并非真实的电话号码
    })
  },
  more: function() {
    this.setData({ showAll: !this.data.showAll })
  }
})
