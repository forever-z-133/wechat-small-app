const app = getApp()
import post from '../ajax.js';
import { money } from '../../utils/util.js';
let imgUrl = 'https://ApiMall.kdcer.com/'

let userId = null;
let mainData = null;

Page({
  data: {
    list: {
      data: [],
      state: 'none',
    },
    chosen: null,
  },
  onPullDownRefresh: function () {
    this.reload_list();
  },
  onShow: function () {
    app.entry_finish(res => {
      userId = res.userId
      this.reload_list(false, r => {
        mainData = r;
      });
    })
  },
  choose: function(e) {
    var i = e.currentTarget.dataset.index;
    var list = this._now_list().data;
    list[i].checked = !list[i].checked;
    var list2 = list.filter(x => x.checked);
    var price = list2.reduce((re, x) => re + x.price, 0);
    var count = list2.length;
    this.setData({ priceAll: money(price), chosen: count, list: this.data.list });
  },
  chooseAll: function () {
    var list = this._now_list().data;
    if (list.length && list.length > this.data.chosen) {
      var price = list.reduce((re, x) => re + x.price, 0);
      var count = list.length;
      list = list.map(x => { x.checked = true; return x });
      this.setData({ priceAll: money(price), chosen: count, list: this.data.list });
    } else {
      list = list.map(x => { x.checked = false; return x });
      this.setData({ priceAll: 0, chosen: 0, list: this.data.list });
    }
  },

  // 生成草稿订单
  addToOrder: function() {
    // 已选中的货单的ID
    var ids = this.data.list.data.reduce((re,item) => {
      item.checked && re.push(item.id); return re;
    }, []);
    if (ids.length < 1) {
      wx.showModal({
        content: '至少也要选个商品吧',
        showCancel: false,
      }); return;
    }
    // 进行请求
    post.toOrder(userId, ids, null, res => {
      if (!res.State) {
        wx.showModal({
          title: '新建订单失败',
          content: JSON.stringify(res),
        }); return;
      }
      // 成功则跳往订单确认页
      wx.setStorage({
        key: 'confirm',
        data: res,
        success: () => {
          wx.navigateTo({ url: '../confirm/confirm' })
        }
      })
    });
  },


  // ------------------------------ 列表部分
  // 列表数据转化
  convert_list: function(r) {
    return r.map(x => {
      x.name = x.Commodity.Name;
      x.id = x.Id;
      x.img = imgUrl + x.Commodity.Files.swiper[0].PicUrl;
      x.desc = money(x.Commodity.Price);
      x.price = x.Commodity.Price;
      x.link = '../detail/detail?Id=' + x.Commodity.Id
      x.theight = 2;
      x.dheight = 1;
      x.checked = false;
      x.number = x.BuyNum;
      return x;
    })
  },
  // 更新当前列表数据
  update_list: function (r, callback) {
    let nowList = this._now_list().data;
    nowList = nowList.push.apply(nowList, r);
    this.setData({ list: this.data.list });
    callback && callback(r)
  },
  // 加载更多当前列表
  load_list: function (loading = true, callback) {
    loading && wx.showLoading();
    post.cart_list(userId, r => {
      wx.hideLoading();
      wx.stopPullDownRefresh();
      wx.hideNavigationBarLoading();
      r = this.convert_list(r.DataList);
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
  _now_list: function () {
    return this.data.list;
  },
  _default_data: function () {
    return new Array(6).fill().map((p, i) => {
      var price = parseFloat((Math.random() * 10).toFixed(2))
      return {
        name: '索引'.repeat(Math.random() * 10 >> 0),
        desc: money(price),
        price: price,
        theight: 2,
        dheight: 1,
        checked: false,
      }
    });
  },
  prevent: function(){ return false },
})