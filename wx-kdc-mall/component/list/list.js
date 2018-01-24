// 商品列表 组件
Component({
  properties: {
    listData: {
      type: Array,
      // observer: function(newVal, oldVal) {
      //   var result = this.filter(newVal);
      //   this.setData({ list: result })
      // }
    },
    listStyle: {
      type: String,
      value: 'list-text-cover',
    }
  },
  data: {
  },
  attached: function () {
    // console.log('xxxx', this.data)
  },
  methods: {
    // filter: function(r) {
    //   return r.filter((p, i) => {
    //     return i > 0;
    //   })
    // }
  }
})
