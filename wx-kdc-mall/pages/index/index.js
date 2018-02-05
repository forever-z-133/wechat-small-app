const app = getApp()
import post from '../ajax.js';

let imgUrl = 'https://ApiMall.kdcer.com/'

// 用户数据
let UnionId = null;
let mainInfo = null;
let userInfo = null;

Page({
  prevent: function() { return false },
  data: {
    banner: [],
    pageData: [],
  },
  onLoad: function () {
    wx.setNavigationBarTitle && wx.setNavigationBarTitle({
      title: '首页'
    });
    wx.setScreenBrightness && wx.setScreenBrightness({
      value: .6,
    });
    post.page('首页', res => {
      res.Carousel.map(item => {
        item.img = imgUrl + item.Pic;
        item.link = item.Router || '#';
      })
      res.PageData.map(section => {
        section.PageData.UpperList.map(item => {
          item.name = item.Name;
          item.img = imgUrl + item.Pic;
          item.link = item.Router;
        })
        section.Commodity.map(item => {
          item.name = item.Name;
          item.img = imgUrl + item.Pic;
          item.desc = item.Des;
          item.price = item.Price;
          item.link = '../detail/detail?Id=' + item.CommodityId;
        })
      })

      this.setData({
        banner: res.Carousel,
        pageData: res.PageData,
      })

      console.log(res.PageData)
    })
  },
  onShow: function () {
    this.main(null, false);
  },
  onPullDownRefresh: function () {
    this.main();
  },
  // 主入口
  main: function (callback, hasToast = true) {
    // !hasToast && wx.showLoading({ mask: true });
  },
  // 入口数据处理
  main_entry: function() {
  },

})