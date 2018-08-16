// pages/redirect/index.js
import { alert, getValueFromUrl } from '../../utils/util.js';

Page({
  data: {
  
  },
  onLoad: function (options) {
    let pagePath = getValueFromUrl('pagePath', options);
    if (!pagePath) return alert('参数有误');
    pagePath = decodeURIComponent(pagePath);
    wx.redirectTo({ url: pagePath });
  },
})