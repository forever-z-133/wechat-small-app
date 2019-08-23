// pages/productRecommend/index.js

import post from '../../utils/post.js';
import {
  alert,
  objectToString,
  urlAddSearch,
  returnNoEmptyObject,
} from '../../utils/util.js';
var app = getApp();

Page({
  data: {
    entryData: undefined,
    detailData: undefined,
  },
  onLoad: function (options = {}) {
    options = Object.assign({}, options, options.query);
    this.options = options;
  },
  onShow: function () {
    const { env_now } = app.data;
    
    if (!returnNoEmptyObject(env_now)) return;

    app.getEntryData(this.options).then(entryData => {
      console.log('扫码结果', entryData);
      this.setData({ entryData });
      this.options = entryData || {};
    }).then(() => {
      this.baseDataIsOK();
    });
  },
  baseDataIsOK() {
    this.getProductRecommendDetail(data => {
      var listData = data.onlineProductDtoList || [];
      // if (listData.some(item => item.sellStatus !== 'ON_SELL')) {
      //   return alert('推荐商品已失效');
      // }
      // if (listData.some(item => Number(item.storageAmount) < 1)) {
      //   return alert('推荐商品已失效');
      // }
      this.setData({ detailData: data, data: data });
    });
  },
  // 拿取详情
  getProductRecommendDetail(callback) {
    const { productRecommendId: id } = this.options;
    if (!id) return alert('缺少必要参数 productRecommendId');
    const params = { id: id };
    post.getProductRecommendDetail(params, res => {
      console.log(res)
      callback && callback(res);
    });
  },
  // 转发
  onShareAppMessage: function () {
    const { productRecommendId: id } = this.options;
    const {
      sharingTitle: title,
      sharingPictureUrl: imageUrl,
      institutionId, recommendUserId, blCampusId
    } = this.data.detailData;
    const params = {
      iid: institutionId, wid: recommendUserId, cid: blCampusId,
      redirect: 'confirmOrder?productRecommendId=' + id
    };
    let path = urlAddSearch('/pages/register/index', objectToString(params));
    const json = { title, path, imageUrl };
    console.log('转发出去的链接', path);
    return json;
  },
})