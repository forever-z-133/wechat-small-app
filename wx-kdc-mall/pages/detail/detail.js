// pages/detail/detail.js
const app = getApp()
import post from '../ajax.js';
import {money} from '../../utils/util.js';
let WxParse = require('../../utils/wxParse/wxParse.js');
let imgUrl = 'https://ApiMall.kdcer.com/'

let mainData = null;
let userId = null;

let skuData = null;
let skuArr = null;
let skuId = null;

Page({
  data: {
    data: {},
    content: [],
    modal_show: false,
    modal: {},
  },
  onLoad: function(option) {
    let id = option.Id;
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
    let allPrice = res.CommonditySkus.reduce((re, x) => re.concat([x._price]), [])
    let max = Math.max.apply(Math, allPrice);
    let min = Math.min.apply(Math, allPrice);
    let price = min == max ? money(min) : money(min) + '-' + money(max);
    this.tempPrice = price;

    let allStore = res.CommonditySkus.reduce((re, x) => re.concat([x._repertory]), [])
    let store = allStore.reduce((re, x) => re + x, 0);
    this.tempStore = store;

    // 轮播、标题等基础数据
    this.setData({
      banner: res.Detail.PicFile.swiper.map(x => {
        x.img = imgUrl + x.PicUrl; x.link = '#'; return x;
      }),
      data: {
        title: res.Detail.Name,
        price: price,
        store: store,
        transform: '包邮'
      },
      modal: {
        number: 1
      }
    })

    // 规格的计算
    skuData = this.initSkuData(res);
    skuArr = this.initSkuArr(res);
    skuArr = updateSkuArr(skuArr, skuData)
    this.setData({ sku: skuArr })
    this.updateMainData();

    // 详情
    let content = res.Detail.PicFile.detail
    if (content.length > 0) {
      let imgs = content.reduce((re, x) => { re.push(imgUrl + x.PicUrl); return re }, [])
      covert_detail_image(imgs, result => {
        this.setData({ content: result })
      })
    } else if (res.Detail.Title != '') {
      WxParse.wxParse('article', 'html', res.Detail.Title, this)
    }
  },
  // sku、规格切换
  radioChange: function (e) {
    let pi = e.currentTarget.dataset.index;
    let ci = parseInt(e.detail.value);
    skuArr.map((part, i) => { if (i >= pi) part.active = -1 })
    skuArr[pi].active = ci;
    skuArr = updateSkuArr(skuArr, skuData);
    this.updateMainData();
    this.setData({ sku: skuArr });
  },
  // 确认加入购物车
  addToCart: function() {
    post.toCart(userId, skuId, res => {
      wx.showToast({ title: '添加成功', mask: true });
      this.setData({ moal_show: false });
    });
  },
  openModal: function () {
    this.setData({ modal_show: true })
  },
  closeModal: function() {
    this.setData({ modal_show: false })
  },
  addNumber: function () {
    this.data.modal.number = Math.min(this.data.modal.store, ++this.data.modal.number);
    this.setData({ modal: this.data.modal });
  },
  minusNumber: function () {
    this.data.modal.number = Math.max(1, --this.data.modal.number);
    this.setData({ modal: this.data.modal });
  },
  initSkuArr: function (res) {
    // skuArr 为渲染结构的数据。即父级关系的数据
    let skuObj = res.SpecDir;
    skuArr = Object.keys(skuObj).reduce((re, partName) => {
      let itemArr = JSON.parse(skuObj[partName])
      itemArr = itemArr.reduce((arr, item) => {
        arr.push({ name: item, index: arr.length, disabled: true }); return arr;
      }, [])
      return re.concat([{ name: partName, child: itemArr, active: -1 }]);
    }, []);
    return skuArr;
  },
  initSkuData: function (res) {
    // skuData 为原始且美化过的数据，即一套sku对应的数据
    skuData = res.CommonditySkus;
    skuData.map((one, i) => {
      one.index = i;
      one.SpecList[0].map((item, j) => {
        item.pindex = i; item.index = j;
      })
      let child = one.SpecList[0].slice(0);
      one.SpecList = child;
    })
    return skuData;
  },
  // 根据 active 的 skuArr，给与当前价格和库存
  updateMainData: function() {
    var arr = skuArr.reduce((re, part) => {
      return re.concat([part.active > -1 ? part.child[part.active].name : []])
    }, [])
    var result = skuData.filter(part => {
      var len = part.SpecList.reduce((re, item) => {
        return re = arr.indexOf(item.Value) ? 1+re : re;
      }, 0);
      return !(len == arr.length)
    })
    if (result.length) {
      result = result[0];
      console.log('选择sku', result);
      skuId = result._id;
      this.data.modal.price = money(result._price);
      this.data.modal.store = result._repertory;
      this.setData({ modal: this.data.modal });
    } else {
      this.data.modal.price = this.tempPrice;
      this.data.modal.store = this.tempStore;
      this.setData({ modal: this.data.modal });
    }
  },
})

//----------------------- 更新 skuArr 的 disable 与 active
function updateSkuArr(arr, data) {
  // 重置 disabled，但 active 在外部进行重置
  arr.map(part => part.child.map(child => child.disabled = true))
  // 复杂的操作...具体请看步骤
  arr.reduce((first, part) => {
    // 从第一级向下匹配，且本级根据上级 active 进行筛选
    var active = !Array.isArray(first) ? first.child[first.active] : null;
    // 先选出上级 active 对应的本级剩余条目，比如上级全年，本级只有烹饪与其匹配
    var last = active ? inSkuData(active.name, data) : data;
    // 从剩余条目中，激活能用的
    part.child.map(child => {
      let ok = inSkuData(child.name, last);
      if (ok.length) child.disabled = false;
    })
    // 进行 active 的赋值
    let temp = part.child.filter(x => !x.disabled);
    part.active = part.active < 0 ? (temp[0] ? temp[0].index : -1) : part.active;
    return part;
  }, [])
  return arr;
}

//----------------------- 从原始规格数据中找出 name 相对的 sku
function inSkuData(name, data) {
  return data.filter(part => part.SpecList.filter(item => item.Value == name).length);
}

//------------------------ 获取每张图的高度
// 小程序的图片不会自己撑起高度，所以从富文本扣出后要进行获取高度
// downloadFile 又有并发限制，所以得改为递归形式
function getImageHiehgt(src, callback) {
  app.getWindow(win => {
    let winW = win.windowWidth - 30;
    wx.downloadFile({
      url: src,
      success: res => {
        let newSrc = res.tempFilePath
        wx.getImageInfo({
          src: newSrc,
          success: r => {
            let height = winW / (r.width / r.height)
            callback && callback(height, src)
          }
        })
      }
    });
  })
}
// 递归图片数组，获取每张图片高度
function loop(arr, fn, finish) {
  let item = arr.shift()
  if (!item) finish();
  else fn(item, function () {
    loop(arr, fn, finish)
  })
}

function covert_detail_image(arr, finish) {
  let result = [];
  loop(arr, function (src, cb) {
    getImageHiehgt(src, function (height, img) {
      result.push({ img, height });
      cb & cb();
    })
  }, function () {
    finish && finish(result);
  })
}