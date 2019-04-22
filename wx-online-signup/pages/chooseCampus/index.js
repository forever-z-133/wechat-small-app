// pages/chooseCampus/index.js

import { alert, getValueFromUrl } from '../../utils/util.js';
import post from '../../utils/post.js';
const app = getApp();

Page({
  data: {
    current: 0,
    studentName: '',
    campusName: '',
    address: '',
    contact: '',
    data: [],
  },
  onShow: function () {
    const { data: res } = app.temp.chooseCampusData || {};
    
    if (!res) {
      return alert('传入参数有误');
    }

    const name = res.studentName || res.userName;
    const listData = res.onlineOrganizationDtos;

    this.setData({ studentName: name });
    this.setSwiperData(listData);
  },
  swiperChange (e) {
    this.setData({ current: e.detail.current+1 });
    this.updataSwiperActive();
  },
  setSwiperData(data) {
    data = data.map((item) => {
      item.id = item.organizationId;
      item.name = item.organizationAliasName;
      return item;
    });
    data.push(''); data.unshift('');
    this.rawData = data;
    this.setData({ data: data, current: 1 });
    this.updataSwiperActive();
  },
  updataSwiperActive() {
    const data = this.rawData[this.data.current];
    this.setData({
      campusName: data.organizationAliasName,
      address: data.address,
      contact: data.contact,
    });
  },
  // 确定
  submit() {
    const data = this.rawData[this.data.current];
    const { organizationId } = data;
    wx.setStorageSync('organizationId', organizationId);
    app.temp.chooseCampusData.organizationId = organizationId;
    wx.navigateBack();
  },
})