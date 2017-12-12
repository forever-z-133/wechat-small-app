//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    page: {
      welcome: true,
      rule: false,
    }
  },
  //事件处理函数
  pageRule: function() {
    this.page('rule', !this.data.page.rule);
  },
  onLoad: function () {
  },
  page: function (target, ifShow) {
    this.data.page[target] = ifShow;
    this.setData({ page: this.data.page })
  }
})
