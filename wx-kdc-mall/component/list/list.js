// 商品列表 组件
Component({
  options: {
    multipleSlots: true,
  },
  properties: {
    listData: {
      type: Array,
      value: [],
      // observer: function(newVal, oldVal) {
      //   var result = this.filter(newVal);
      //   this.setData({ list: result })
      // }
    },
    listStyle: {
      type: String,
      value: 'list-text-cover',
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
    // filter: function(r) {
    //   return r.filter((p, i) => {
    //     return i > 0;
    //   })
    // }
  }
})
