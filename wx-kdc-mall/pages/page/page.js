// pages/page/page.js
const app = getApp()
import post from '../ajax.js';

Page({
  onShareAppMessage: app.share,
  data: {
    date: [],
    list: [],
  },
  onLoad: function() {
    this.load_list(false, function(r){
      console.log(r)
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