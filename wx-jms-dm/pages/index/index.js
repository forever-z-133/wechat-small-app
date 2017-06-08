//index.js
//获取应用实例
let app = getApp()
Page({
  data: {
    winH: 0,
    tabs: [],
    tabs_nav_index: 0,
    products: [],
    swiper_index: [],
    animData: [],
    list_end: [],
  },
  onLoad: function (options) {
    console.log('onLoad', options)
    let that = this

    // 获取屏幕高度
    var res = wx.getSystemInfoSync()
    this.setData({
      winH: res.windowHeight - 50
    })

    // 设始传入参数处理
    let index = +options.tab || this.data.tabs_nav_index
    this.setData({
      tabs_nav_index: index,
    })

    // 初次加载
    // wx.showLoading({ title: '数据请求中...', mask: true })
    wx.request({
      url: 'https://sum.kdcer.com/api/Applet/DmGetInfo?pageNo=1&pageNum=16',
      success: function (r) {
        // console.log('初次加载', r.data)
        // wx.hideLoading()
        that.initTabs(r.data)
        that.initSwiper(r.data)
      },
      fail: function (err) {
        // wx.hideLoading()
        wx.showToast({
          title: '请求出错',
          icon: 'error',
          duration: 2000
        })
      }
    })
  },
  // 转发
  onShareAppMessage: function () {
    let tab = this.data.tabs_nav_index
    return {
      title: '优惠尽在吉买盛',
      path: '/pages/index/index?tab=' + tab + '',
      fail: function () {
        wx.showToast({
          title: '转发失败',
          icon: 'cancel',
          duration: 1000
        })
      }
    }
  },
  // 从数据中获取，渲染导航条选项
  initTabs: function (data) {
    let result = [];
    for (let tab of data) {
      result.push({
        id: tab.Id,
        name: tab.Name,
      })
    }
    let len = result.length
    this.setData({
      tabs: result,
      products: new Array(len),
      swiper_index: new Array(len),
      animData: new Array(len),
      list_end: new Array(len),
    })
  },
  // 切换选项卡
  changeTab: function (e) {
    let index = e.target.dataset.index
    this.setData({
      tabs_nav_index: index,
    })
  },
  // 传入数据，重新渲染列表视图
  initSwiper: function (data, isAadd) {
    let result = this.data.products
    let listEnd = this.data.list_end
    let partIndex = 0

    for (let i in data) {
      // 如果是第一次，将大广告也作为一个商品插入
      if (!isAadd) {
        let first = {
          Picture: data[i].Picture,
          Name: data[i].Name,
          CurrentPrice: 0,
          Time: '',
          Unit: '',
        }
        data[i].list.splice(0, 0, first)
      }

      // 判断是否全部加载光了
      listEnd[i] = data[i].list.length < 1

      // 块初始时为 undefined，改为数组
      if (!result[i]) result[i] = []
      let len = result[i].length

      // 商品分发到不同块
      for (let j in data[i].list) {
        let one = data[i].list[j]
        if (!isAadd) {
          partIndex = (+j < 5 ? 0 : parseInt((+j + 1) / 6))
        } else {
          partIndex = 0
        }
        partIndex += len;
        if (!result[i][partIndex]) {
          result[i][partIndex] = {
            id: i,
            data: [],
          };
        }
        let obj = _convert(one)
        result[i][partIndex].data.push(obj)
      }
    }

    this.setData({
      products: result,
      list_end: listEnd,
    })

    // 商品数据转换成需要的结构
    function _convert(one) {
      let obj = {
        img: 'https://sum.kdcer.com' + one.Picture,
        title: one.Name,
        price: '',
        price2: '',
        unit: one.Unit ? ('元/' + one.Unit) : '',
      }
      let price = one.CurrentPrice.toString()
      if (price.match('.') && price !== '0') {
        price = price.split('.')
        obj.price = price[0]
        obj.price2 = (price[1] ? ('.' + price[1]) : '')
      } else {
        obj.price = one.CurrentPrice || ''
      }
      return obj
    }
  },
  // 上下滑动移动轮播
  swiperStart: function (e) {
    let i = this.data.tabs_nav_index
    let index = this.data.swiper_index[i] || 0
    this.swiper_start_pos = e.touches[0].pageY
    this.offset = -1 * index * this.data.winH
    this.tapStartTime = e.timeStamp
  },
  // 上下滑动移动轮播
  swiperMove: function (e) {
    let y = this.swiper_start_pos
    this.yy = e.touches[0].pageY - y
    // if (Math.abs(this.yy) < 5) return
    let yy = this.offset + this.yy
    this.slideAnimation(yy, 0)
  },
  // 上下滑动移动轮播
  swiperEnd: function (e) {
    let i = this.data.tabs_nav_index
    let result = this.data.swiper_index
    let index = result[i] || 0
    let max = this.data.products[i].length - 1

    // 页码更新
    if (this.yy > 100) {
      index = --index
    } else if (this.yy < -100) {
      index = ++index;
    }
    if (index < 0) index = 0
    if (index > max) index = max
    result[i] = index
    this.setData({
      swiper_index: result
    })

    // 是否加载更多
    // console.log('滑倒了第' + index + '页')
    let listEnd = this.data.list_end[i]
    if (index >= max && !listEnd) {
      this.loadData()
    }

    // 归位动画
    this.offset = -1 * index * this.data.winH
    this.slideAnimation(this.offset, 200)
  },
  slideAnimation: function (translate, speed) {
    let i = this.data.tabs_nav_index
    let result = this.data.animData
    let anim = wx.createAnimation({
      duration: speed,
    });
    anim['translateY'](translate).step();
    result[i] = anim.export()
    this.setData({
      animData: result
    })
  },
  // 获取数据
  loadData: function () {
    let that = this
    this.pageCount = this.pageCount || 3;
    this.pageCount++;
    // wx.showLoading({ title: '数据请求中...', mask: true })
    wx.request({
      url: 'https://sum.kdcer.com/api/Applet/DmGetInfo?pageNo=' + that.pageCount + '&pageNum=6',
      success: function (r) {
        // console.log('加载了第' + that.pageCount + '页', r.data)
        // wx.hideLoading()
        that.initSwiper(r.data, true)
      },
      fail: function (err) {
        // wx.hideLoading()
        wx.showToast({
          title: '请求出错',
          icon: 'warn',
          duration: 2000
        })
      }
    })
  },
})
