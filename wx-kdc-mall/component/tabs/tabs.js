// component/tabs/tabs.js
Component({
  options: {
    multipleSlots: true,
  },
  properties: {
    listData: {
      type: Array,
      value: [],
    },
    dateType: {
      type: String,
      value: 'array',  // 或者 json
    },
    dateKey: {
      type: String,
      value: 'index',
    },
    staticHead: {
      type: Boolean,
      value: false,
    }
  },
  data: {
    nowIndex: 0,
  },
  attached: function () {
    var i = this.data.nowIndex || 0;
    this.triggerEvent('tabinit', { index: i });
  },
  methods: {
    tabChange: function(e){
      var i = e.currentTarget.dataset.index || 0;
      this.setData({ nowIndex: i });
      this.triggerEvent('tabchange', {index: i});
    }
  }
})
