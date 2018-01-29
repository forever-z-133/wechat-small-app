const app = getApp()
import post from '../ajax.js';
let listHeight = 0;

Page({
  data: {
    tabs: ["系统消息", "互动消息"],
    tabIndex: 0,
    list: [],
  },
  onLoad: function () {
    let len = this.data.tabs.length + 1
    this.data.list = new Array(len).fill().map(x => { return { data: [], state: 'load' }});

    app.getWindow(res => {
      listHeight = res.windowHeight - 50;
      this.setData({ listHeight: res.windowHeight - 50 });
    })

    this.load_list();
  },
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading()
    this.reload_list()
  },
  onReachBottom: function () {
    this.load_list();
  },
  // tabs 切换
  tabchange: function (e) {
    let i = e.detail.index || 0;
    this.setData({ tabIndex: i });
    var nowList = this.data.list[i].data;
    if (nowList.length < 1) this.load_list();
    wx.pageScrollTo({ scrollTop: 0, duration: 0 });
    wx.startPullDownRefresh();
  },
  // 更新当前列表数据
  update_list: function (r, callback) {
    let nowList = this._now_list().data;
    nowList = nowList.push.apply(nowList, r);
    if (r.length < 1) nowList.state = 'empty';
    this.setData({ list: this.data.list });
    callback && callback(r)
  },
  // 加载更多当前列表
  load_list: function (loading = true, callback) {
    loading && wx.showLoading();
    post.page('xxx', r => {
      wx.hideLoading();
      wx.stopPullDownRefresh();
      wx.hideNavigationBarLoading();
      var r = this._default_data();
      this.update_list(r, callback);
    });
  },
  // 重置当前列表
  reload_list: function (callback) {
    let list = this._now_list();
    list.data = [];
    list.state = 'load';
    this.load_list(false, callback);
  },
  _now_list: function() {
    return this.data.list[this.data.tabIndex];
  },
  _default_data: function() {
    return new Array(6).fill().map((p, i) => {
      return { name: '索引' + this.data.tabIndex + ';单次' + i }
    });
  }
})