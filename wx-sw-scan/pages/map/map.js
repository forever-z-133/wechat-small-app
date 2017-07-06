//logs.js
Page({
  data: {
  },
  onLoad: function () {
  },
  scan: function(){
    wx.scanCode({
      onlyFromCamera: true,
      success: function (res) {
        console.log(res)
      }
    });
  }
})