const app = getApp()
import post from '../ajax.js';

// 用户数据
let UnionId = null;
let mainInfo = null;
let userInfo = null;

Page({
  data: {
    banner: [1,2],
    tabs: [
      {
        link: '/pages/page/page',
        img: '',
        name: 'xxxx1',
      },
      {
        link: '/pages/page/page',
        img: '',
        name: 'xxxx2',
      },
      {
        link: '/pages/page/page',
        img: '',
        name: 'xxxx3',
      }
    ],
    list: [],
  },
  onLoad: function () {
    wx.setNavigationBarTitle && wx.setNavigationBarTitle({
      title: '首页'
    });
    app.getWindow(res => {
      this.setData({
        winW: res.windowWidth,
        winH: res.windowHeight,
      })
    });
    var raw = this.data.tabs;
    var list = this.data.list;
    var xx = ['xxxx', 'yyyy', 'zzzz'];
    for (let k in xx) {
      list.push(raw.slice(0).map((p, i) => { p.name = xx[k] + i; return p }))
    }
    this.setData({ list: list })
  },
  tabchange: function(e) {
    console.log(e.detail)
  },
  onShow: function () {
    this.main(null, false);
  },
  onPullDownRefresh: function () {
    this.main();
  },
  // 主入口
  main: function (callback, hasToast = true) {
    !hasToast && wx.showLoading({ mask: true });
    wx.setScreenBrightness && wx.setScreenBrightness({
      value: .6,
    });
    app.login(code => {
      app.getInfo(res => {
        mainInfo = res
        userInfo = res.userInfo
        post.entry(code, res, this.main_entry)
        wx.hideLoading();
        wx.stopPullDownRefresh();
        callback && callback();
      })
    })
  },
  // 入口数据处理
  main_entry: function() {
  },
})