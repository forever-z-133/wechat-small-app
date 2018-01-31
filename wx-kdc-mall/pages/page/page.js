// pages/page/page.js
const app = getApp()
import post from '../ajax.js';
let imgUrl = 'https://ApiMall.kdcer.com/'

Page({
  onShareAppMessage: app.share,
  data: {
    date: [],
    list: [],
  },
  onLoad: function(option) {
    var page = option.Title;

    post.page(page, res => {
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
  dateInit: function(e) {
    var date = e.detail.date;
    this.setData({ date: date });
  },
  update_list: function(r, callback) {
    r = new Array(6).fill();
    r = r.map((p, i) => {
      return { name: 'xx' + i }
    });
    r = this.data.list.concat(r);
    this.setData({ list: r });
    callback && callback(r)
  },
  load_list: function (reload = false, callback) {
    if (reload) this.data.list = [];
    post.page('xxx', r => {
      this.update_list(r, callback);
    });
  },
})