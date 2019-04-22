// pages/preFundsChangeHistoryDetail/index.js
import { alert, getValueFromUrl } from '../../utils/util.js';
import post from '../../utils/post.js';

const app = getApp();

Page({
  data: {
    data: {},
    showPayButton: false,
  },
  onLoad: function (options = {}) {
    options = Object.assign({}, options, options.query);
    this.id = options.preFundsChangeHistoryId;
    console.log('收款订单ID', this.id)
    if (!this.id) {
      return alert('缺少重要参数，无法进行操作');
    }
    wx.setNavigationBarTitle({ title: '收款单' });
  },
  onShow: function () {
    if (this.nowFirstLoad && !this.systemReady) return;
    this.nowFirstLoad = true;
    wx.showLoading({ mask: true });

    const gulp = ['wxUnionId', 'auth', 'enviroment'];
    app.systemSetup(gulp).then(res => {
      this.systemReady = true;
      app.data.user = app.data.user || wx.getStorageSync('user');
      this.load_data();
    });
  },
  onPullDownRefresh() {
    this.load_data();
  },
  load_data: function () {
    var data = { preFundsChangeHistoryId: this.id };
    post.getFundOrderDetail(data, res => {
      wx.hideLoading();
      wx.stopPullDownRefresh();
      
      const typeObj = {
        'ONE_ON_ONE_COURSE': '1对1',
        'ONE_ON_N_GROUP': '1对N',
        'SMALL_CLASS': '班课',
        'GOODS': '物品',
        'OTHERS': '其他',
      };

      res.contractProductList = res.contractProductList.map(x => {
        x.single = (x.planAmount / x.quantity).toFixed(2);
        x.should = (x.planAmount - x.promotionAmount).toFixed(2);
        x.planAmount = x.planAmount.toFixed(2);
        x.promotionAmount = x.promotionAmount.toFixed(2);
        x.type = typeObj[x.type];
        return x;
      });

      res.signTime = this.formatDate(res.signTime);
      res.thisAmount = res.thisAmount.toFixed(2);
      res.contractAmount = res.contractAmount.toFixed(2);
      res.promotionAmount = res.promotionAmount.toFixed(2);
      res.shouldPayAmount = res.shouldPayAmount.toFixed(2);
      res.paidAmount = res.paidAmount.toFixed(2);

      var name = res.studentName;
      name = name ? ' - ' + name : '';
      wx.setNavigationBarTitle({ title: '收款单' + name });

      this.needPay = res.thisAmount;

      this.setData({
        data: { ...res },
        showPayButton: res.payStatus === 'PAYING',
      });
    });
  },
  startPay: function() {
    var data = {
      totalFee: this.needPay * 100,
      preFundsChangeHistoryId: this.id
    };
    data = JSON.stringify(data);
    wx.navigateTo({
      url: '../paypage/index?fromFund=' + data,
    });
  },
  formatDate (dateStr) {
    if (!dateStr) return '';
    var arr = dateStr.split(/[- :]/);
    arr = arr.map(x => parseInt(x));
    var date = new Date(arr[0], arr[1]-1, arr[2], arr[3], arr[4], arr[5]);
    var str = date.getFullYear() + ' 年 ';
    str += (1 + date.getMonth()) + ' 月 ';
    str += date.getDate() + ' 日 ';
    return str;
  },
  onShareAppMessage() {
    var name = this.data.data.studentName || '';
    var title = name ? '' + name + '' : name;
    title = title + '合同收款单';
    var path = '/pages/preFundsChangeHistoryDetail/index';
    var id = this.id ? 'preFundsChangeHistoryId=' + this.id : '';
    if (!id) alert('未获取到合同ID，不允许转发');
    path = path + '?' +  id;
    var share = { title, path };
    console.log('收款单转发：', share)
    return share;
  }
})