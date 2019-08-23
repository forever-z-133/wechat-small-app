// components/chooseCampus/index.js
Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    campusData: Object
  },
  data: {
    current: 0,
    studentName: '',
    campusName: '',
    address: '',
    contact: '',
    data: [],
  },
  ready() {
    const { campusData } = this.data;
    if (!campusData) return;
    const { studentName, userName, onlineOrganizationDtos: list = [] } = campusData;
    this.setData({ studentName: studentName || userName });
    this.setSwiperData(list);
  },
  methods: {
    swiperChange(e) {
      this.setData({ current: e.detail.current + 1 });
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
      this.triggerEvent('change', { organizationId });
    },
  }
})
