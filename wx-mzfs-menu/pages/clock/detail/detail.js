// pages/clock/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    gallery: ['']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },
  // 查看图片
  preview: function(e) {
    console.log(e)
    var index = e.target.dataset.index;
    console.log(index);
    wx.previewImage({
      urls: ['/img/temp/1.png'],
      current: 0,
    })
  },
})