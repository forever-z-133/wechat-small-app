// pages/detail/detail.js
const app = getApp()
import post from '../ajax.js';
import {money} from '../../utils/util.js';
var WxParse = require('../../utils/wxParse/wxParse.js');
let imgUrl = 'https://ApiMall.kdcer.com/'

var mainData = null;
var userId = null;

var skuData = null;

Page({
  data: {
    data: {},
    content: [],
    modal_show: true,
    modal: {},
  },
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

    // 获取详情
    post.detail(id, res => {
      mainData = res;
      this.update(res);
    })

    // 获取身份 ID
    app.entry_finish(r => {
      userId = app.data.userId
      console.log('用户Token', userId)
    })
  },
  update: function (res) {
    // 价格和库存的计算
    var allPrice = res.CommonditySkus.reduce((re, x) => re.concat([x._price]), [])
    var max = Math.max.apply(Math, allPrice);
    var min = Math.min.apply(Math, allPrice);
    var price = min == max ? money(min) : money(min) + '-' + money(max);

    var allStore = res.CommonditySkus.reduce((re, x) => re.concat([x._repertory]), [])
    var store = allStore.reduce((re, x) => re + x, 0);

    // 规格的计算
    skuData = res.CommonditySkus;
    skuData.map((one, i) => {
      one.index = i;
      one.SpecList[0].map((item, j) => {
        item.pindex = i; item.index = j;
      })
    })
    var skuObj = res.SpecDir;
    var skuArr = Object.keys(skuObj).reduce((re, partName) => {
      var itemArr = JSON.parse(skuObj[partName])
      itemArr = itemArr.reduce((arr, item) => {
        arr.push({ name: item, index: arr.length, disabled: false }); return arr;
      }, [])
      return re.concat([{ name: partName, child: itemArr, active: 0 }]);
    }, []);
    justifySku(0, skuArr, skuData);
    // console.log(skuArr, skuData)

    function justifySku(i, arr, data) {
      var partName = arr[i].name;
      var item = arr[i].child[0];
      console.log(data)
      var temp = data[0].SpecList[0].filter(x => x.Value == item.name)
      console.log(temp)
    }

    // 轮播、标题等基础数据
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
      sku: skuArr,
      modal: {
        price: price,
        store: store,
        number: 1
      }
    })

    // 详情
    var content = res.Detail.PicFile.detail
    if (content.length > 0) {
      var imgs = content.reduce((re, x) => { re.push(imgUrl + x.PicUrl); return re }, [])
      covert_detail_image(imgs, result => {
        this.setData({ content: result })
      })
    } else if (res.Detail.Title != '') {
      WxParse.wxParse('article', 'html', res.Detail.Title, this)
    }
  },
  // sku、规格切换
  radioChange: function (e) {
    // var i = e.currentTarget.dataset.index;
    // var sku = this.data.sku[i];
    // var part = sku.part;
    // var item = e.detail.value;
    // var newIndex = sku.item.indexOf(item);
    // sku.active = newIndex;
    // var chosen = this.data.sku.reduce((re,x) => {re.push(x.item[x.active]);return re}, []);
    // // var obj = this.findThisSku(chosen);
    // // console.log(obj)
    // this.setData({ sku: this.data.sku })
  },
  openModal: function () {
    this.setData({ modal_show: true })
  },
  closeModal: function() {
    this.setData({ modal_show: false })
  },
  addNumber: function () {
    this.data.modal.number += 1;
    this.setData({ modal: this.data.modal });
  },
  minusNumber: function () {
    this.data.modal.number = Math.max(1, --this.data.modal.number);
    this.setData({ modal: this.data.modal });
  },
  findThisSku: function(chosen) {
    // var data = skuData.slice(0);
    // var temp = null;
    // for (var i in chosen) {
    //   var item = 
    // }
  }
})

function isThisSku(items, chosen) {
  var result = null;
  var temp = items.slice(0)
  temp.map((x, i) => x.active = i)
  console.log(temp)
  for (var i in chosen) {
    temp = temp.filter(x => x.Value == chosen[i]);
    console.log(temp, chosen[i])

  }
  // console.log(items, chosen)
}


// 获取每张图的高度
// 小程序的图片不会自己撑起高度，所以从富文本扣出后要进行获取高度
// downloadFile 又有并发限制，所以得改为递归形式
function getImageHiehgt(src, callback) {
  app.getWindow(win => {
    var winW = win.windowWidth - 30;
    wx.downloadFile({
      url: src,
      success: res => {
        var newSrc = res.tempFilePath
        wx.getImageInfo({
          src: newSrc,
          success: r => {
            var height = winW / (r.width / r.height)
            callback && callback(height, src)
          }
        })
      }
    });
  })
}
// 递归图片数组，获取每张图片高度
function loop(arr, fn, finish) {
  var item = arr.shift()
  if (!item) finish();
  else fn(item, function () {
    loop(arr, fn, finish)
  })
}

function covert_detail_image(arr, finish) {
  var result = [];
  loop(arr, function (src, cb) {
    getImageHiehgt(src, function (height, img) {
      result.push({ img, height });
      cb & cb();
    })
  }, function () {
    finish && finish(result);
  })
}