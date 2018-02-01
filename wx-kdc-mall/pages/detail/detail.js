// pages/detail/detail.js
const app = getApp()
import post from '../ajax.js';
import {money} from '../../utils/util.js';
var WxParse = require('../../utils/wxParse/wxParse.js');
let imgUrl = 'https://ApiMall.kdcer.com/'

var mainData = null;

Page({
  onLoad: function(option) {
    var id = option.Id;
    if (!id) {
      wx.showModal({
        content: '未获得详情ID',
        showCancel: false,
        confirmText: '返回首页',
        success: () => wx.reLaunch({ url: '/pages/index/index' })
      }); return false;
    }

    post.detail(id, res => {
      mainData = res;
      var allPrice = res.CommonditySkus.reduce((re, x) => re.concat([x._price]), [])
      var max = Math.max.apply(Math, allPrice);
      var min = Math.min.apply(Math, allPrice);
      var price = min == max ? money(min) : money(min) + '-' + money(max);

      var allStore = res.CommonditySkus.reduce((re, x) => re.concat([x._repertory]), [])
      var store = allStore.reduce((re, x) => re+x, 0);

      var content = res.Detail.PicFile.detail
      if (content.length > 0) {
        content.map((x, i) => {
          wx.downloadFile({
            url: imgUrl + x.PicUrl,
            success: res => {
              console.log(res);
              wx.getImageInfo({
                src: res.tempFilePath,
                complete: r => {
                  var height = r.width / r.height * 320
                  content[i] = {
                    img: res.tempFilePath,
                    height: height,
                  }
                }
              })
            }
          })
        })
      } else if (res.Detail.Title != '') {
        WxParse.wxParse('article', 'html', res.Detail.Title, this)
      }
      
      this.setData({
        banner: res.Detail.PicFile.swiper.map(x => {
          x.img = x.PicUrl;
          x.link = '#';
        }),
        data: {
          title: res.Detail.Name,
          price: price,
          store: store,
          transform: '包邮'
        },
      })
    })

    // this.setData({ data: this._default_data() })

    // // 获取身份
    // app.entry_finish(r => {
    //   console.log(r)
    // })
  },
  _default_data: function() {
    WxParse.wxParse('article', 'html', '<img src="data:image/png;base64,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">', this);
    return {
      title: '标题'.repeat(Math.random()*30>>0),
      price: money(Math.random() * 1000 >> 0),
      store: Math.random() * 1000 >> 0,
      transform: '快递',
    }
  },
})