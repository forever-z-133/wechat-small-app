// components/chooseCampus/index.js

import {
  alert,
  getValueFromUrl
} from '../../utils/util.js';
const app = getApp();

Component({
  properties: {
    list: {
      type: Array,
      value: [],
      observer: function(data) {
        data && data.length && this.setSwiperData(data);
      }
    },
    studentName: {
      type: String,
      value: ''
    },
  },
  data: {
    current: 0,
    campusName: '',
    address: '',
    contact: '',
  },
  methods: {
    swiperChange(e) {
      var i = e.detail.current;
      this.setData({
        current: i + 1
      });
      this.updataSwiperActive(i);
    },
    setSwiperData(data) {
      data = data.map((item) => {
        item.id = item.organizationId;
        item.name = item.organizationAliasName;
        return item;
      });
      data.push('');
      data.unshift('');
      this.rawData = data;
      this.setData({
        data: data,
        current: 1
      });
      this.updataSwiperActive(1);
    },
    updataSwiperActive(index) {
      var i = this.data.current;
      var data = this.rawData[i];
      var params = {};
      this.setData({
        campusName: data.organizationAliasName,
        address: data.address,
        contact: data.contact,
      });
    },
    submit() {
      var i = this.data.current;
      var data = this.data.list[i];
      var organizationId = data.organizationId;
      var params = { organizationId, data };
      this.triggerEvent('submit', params);
    },
  }
})