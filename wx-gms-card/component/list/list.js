// 商品列表 组件
Component({
  options: {
    multipleSlots: true,
  },
  properties: {
    listData: {
      type: Array,
      value: [],
    },
    listStyle: {
      type: String,
      value: '',
    },
    listState: {
      type: String,
      value: 'load',
    }
  },
  data: {
  },
  attached: function () {
    // console.log(this.data.listData)
  },
  methods: {
    clickItem: function(e) {
      var data = e.currentTarget.dataset;
      this.triggerEvent('click', {
        id: data.id,
        index: data.index,
      })
    }
  }
})
