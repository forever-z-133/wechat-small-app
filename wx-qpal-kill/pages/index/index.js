// 公共方法
const app = getApp()
// 一堆请求
import post from './ajax.js';
// 全局标量
let GUID = null;
let userInfo = null; // 用户数据
let ctx = null;  // canvas 对象
const imgs = [ // 图片对象
  { name: 'save', src: '/img/for-save.jpg', }
];
const source = {}; // 图片加载结果
let thingsOk = null;

Page({
  data: {
    page: {
      main: true,
      rule: false,
      save: false,
      good: true,
      bad: false,
    },
    date: 0,  // 本活动第几场
    time: 0,  // 今天第几场
    ordered: false, // 已预约
    can: false,  // 能抽
    timecount: 0,  // 倒计时
    saveImg: '',
    imgs: imgs,  // 待加载的图片
  },
  onLoad: function () {
    // 登录与授权
    app.login(code => {
      app.getInfo(res => {
        userInfo = res.userInfo
        post.entry(code, res, this.entry)
        if (thingsOk) thingsOk();
        thingsOk = this.imgsLoaded;
      })
    })
  },
  // 入口数据处理
  entry: function(r) {
    // 入口数据初始化
    var r = r.data;
    GUID = r.UserGuid;
    this.data.can = false;
    var list = r.ScreenList;
    // 如果 State 有为 true 的就是正在抽奖
    this.data.can = list.some(x => x.State);
    // 剔除已过期的场次
    list = list.filter(x => x.SpanTime > 0);
    // 剩下的第一个就是下一场
    if (list[0]) {
      console.log('下一场', list[0])
      this.data.date = (list[0].ScreenId - 1) / 2 >> 0;
      this.data.time = (list[0].ScreenId - 1) % 2;
      this.data.timecount = list[0].SpanTime;
    }
    // 修改数据
    this.setData({
      can: this.data.can,
      date: this.data.date,
      time: this.data.time,
      timecount: this.data.timecount,
    });
    // 开启倒计时
    this.timecount();
  },
  // 倒计时
  timecount: function(){
    setInterval(() => {
      this.setData({ timecount: --this.data.timecount });
      if (this.data.timecount < 0) {
        this.setData({ can: true });
        wx.reLaunch({
          url: './index',
        })
      }
    }, 1000);
  },
  // 图片加载
  loadImage: function(e) {
    var total = 0, now = 0;
    for (var i in imgs) total++;
    source[e.target.dataset.name] = {};
    source[e.target.dataset.name].elem = e;
    source[e.target.dataset.name].width = e.detail.width;
    source[e.target.dataset.name].height = e.detail.height;
    for (var i in source) now++;
    if (now == total) {
      if (thingsOk) thingsOk();
      thingsOk = this.imgsLoaded;
    }
  },
  // 所有图片加载完成
  imgsLoaded: function () {
    this.canvas(path => {
      this.setData({ saveImg: path });
    })
  },
  // canvas 绘制
  canvas: function (callback) {
    // 初始化 canvas
    ctx = wx.createCanvasContext('forWechat')
    // 画图
    ctx.drawImage('/img/for-save.jpg', 0, 0, 1220, 1800);
    // 画字
    ctx.setFillStyle('#ffffff')
    ctx.setFontSize(50)
    ctx.setTextAlign('center')
    ctx.setTextBaseline('middle')
    ctx.fillText(userInfo.nickName + '邀请你一起来0元秒杀', 610, 640)
    ctx.fillText('资生堂惠润柔净洗发组合', 610, 730)
    ctx.draw()
    // 完成
    setTimeout(() => {
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: 1220,
        height: 1800,
        destWidth: 1220,
        destHeight: 1800,
        fileType: 'jpg',
        canvasId: 'forWechat',
        success: res => {
          console.log('图片生成', res.tempFilePath)
          callback && callback(res.tempFilePath)
        }
      })
    }, 500)
  },
  // 页面处理函数
  pageRule: function () {
    this.page('rule', !this.data.page.rule);
  },
  showSave: function () {
    wx.showLoading();
    if (!this.data.saveImg) {
      this.Timer = setInterval(() => {
        this.showSave()
      }, 1000)
      return;
    } else {
      clearInterval(this.Timer)
      wx.hideLoading();
    }
    // this.data.page.save = true;
    // this.setData({ page: this.data.page })
    wx.saveImageToPhotosAlbum({
      filePath: this.data.saveImg,
      success: res => {
        this.data.page.save = true;
        this.setData({ page: this.data.page })
      }
    })
  },
  closeSave: function () {
    this.page('save', false);
  },
  showGood: function () {
    this.page('good', true);
  },
  closeGood: function() {
    this.page('good', false);
  },
  showBad: function () {
    this.page('bad', true);
  },
  closeBad: function () {
    this.page('bad', false);
  },
  page: function (target, ifShow) {
    this.data.page[target] = ifShow;
    this.setData({ page: this.data.page })
  },
})