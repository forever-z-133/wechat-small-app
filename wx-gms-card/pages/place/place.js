
const app = getApp();
import post from '../ajax.js';

Page({
  data: {
    list: {
      data: [],
      state: 'load',
    }
  },
  onLoad: function () {
    this.reload_list();
  },
  // onShow: function () {
  //   this.load_list();
  // },



  click: function (e) {
    var index = e.detail.index;
    var list = this._now_list();
    var item = list.data[index];
    if (item.choosen) return;
    console.log('选了哪个地址', index, item);
    wx.reLaunch({
      url: '../index/index?place=' + index,
      complete: r => {
        console.log(r)
      }
    });
    list.data.forEach((x, i) => {
      x.choosen = false;
      if (index == i) x.choosen = true;
    });
    this.setData({
      list: this.data.list
    });
  },



  // ------------------------------ 列表部分
  // 列表数据转化
  convert_list: function (r) {
    return r.forEach(x => {
    })
  },
  // 更新当前列表数据
  update_list: function (data, callback) {
    // let r = this.convert_list(data);
    let r = this._default_data();
    console.log('列表数据', r)
    let list = this._now_list();
    if (r && !r.length) list.state = 'empty';
    list.data = (list.data || []).concat(r || []);
    this.setData({ list: this.data.list });
    callback && callback(r)
  },
  // 加载更多当前列表
  load_list: function (callback, hideLoad) {
    hideLoad && wx.showLoading();
    this.update_list(null, callback);
    // post.cart_list(userId, r => {
    //   wx.hideLoading();
    //   wx.stopPullDownRefresh();
    //   wx.hideNavigationBarLoading();
    //   this.update_list(r, callback);
    // });
  },
  // 重置当前列表
  reload_list: function (callback) {
    let list = this._now_list();
    list.data = [];
    list.state = 'load';
    this.load_list(false, callback);
  },
  _now_list: function () {
    return this.data.list;
  },
  _default_data: function () {
    return new Array(20).fill().map((p, i) => {
      return {
        id: 1,
        name: '门店名称',
        desc: '门店具体位置',
        distence: (Math.random() * 100 >> 0) + 'km',
        choosen: i == 2,
      }
    });
  },
})