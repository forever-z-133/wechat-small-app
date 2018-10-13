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
    var student = wx.getStorageSync('student') || app.data.student || {};
    this.sid = student.studentId || app.data.sid || this.sid;
    if (!this.sid) return alert('缺少学生 ID 信息');
    this.sn = student.studentName || app.data.studentName || this.sn;
    this.sn && this.setData({ studentName: this.sn });

    if (app.data.campusData) {
      var data = app.data.campusData;
      return this.setSwiperData(data);
    }
    this.getWxAppOpenCampus(this.sid, data => {
      this.setSwiperData(data);
    });
  },
  swiperChange (e) {
    this.setData({ current: e.detail.current+1 });
    this.updataSwiperActive();
  },
  getWxAppOpenCampus(sid, callback) {
    const params = { studentId: sid };
    post.getWxAppOpenCampus(params, res => {
      callback && callback(res);
    });
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
    var i = this.data.current;
    var data = this.rawData[i];
    var params = {};
    this.setData({
      campusName: data.organizationAliasName,
      address: data.address,
      contact: data.contact,
    });
  },
  // 确定
  submit() {
    var i = this.data.current;
    var data = this.rawData[i];
    var organizationId = data.organizationId || this.student.campusId;
    app.data.organizationId = organizationId;
    wx.setStorageSync('organizationId', organizationId);
    this.student && wx.setStorageSync('student', this.student);
    wx.navigateBack();
  },
})