// pages/address-add/address-add.js
Page({
  data: {
    region: [],
    male: 0,
    type: -1,
  },
  onLoad: function (options) {
  },
  maleChange: function (e) {
    this.setData({ male: e.detail.value })
  },
  typeChange: function(e) {
    this.setData({ type: e.detail.value })
  },
  province: function (e) {
    console.log(e.detail.value)
    this.setData({ region: e.detail.value });
  }
})