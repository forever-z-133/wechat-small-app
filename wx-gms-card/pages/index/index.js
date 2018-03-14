const app = getApp()
import post from '../ajax.js';

let imgUrl = 'https://ApiMall.kdcer.com/'

// 用户数据
let UnionId = null;
let mainInfo = null;
let userInfo = null;

Page({
  prevent: function () { return false },
  data: {
  },
  onLoad: function (options) {
    console.log(options)
  },
  onShow: function () {
    // var url = 'https://sum.kdcer.com/test/sw_shake/1/'
    // setTimeout(() => {
    //   wx.previewImage({
    //     urls: new Array(200).fill().map((x, i) => url + (i % 26) + '.jpg'),
    //   })
    // }, 500)
  },
  onPullDownRefresh: function () {
  },
  preview: function() {
  }
})