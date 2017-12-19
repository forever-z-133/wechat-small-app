// 公共方法
const app = getApp()
// 一堆请求
import post from './ajax.js';
// 全局标量
let UnionId = null;
let ScreenId = null;

// 是否从中奖的模板消息而来
let fromPrize = false;

let mainInfo = null;
let userInfo = null; // 用户数据
let ctx = null;  // canvas 对象
const imgs = [ // 图片对象
  { name: 'save', src: '/img/for-save.jpg', }
];
const source = {}; // 图片加载结果
let thingsOk = null;
var thisScreen = null;

Page({
  data: {
    page: {
      main: true,
      rule: false,
      save: false,
      good: false,
      bad: false,
    },
    disable: false, // 能否能抽
    date: 0,  // 本活动第几场
    time: 0,  // 今天第几场
    count: 0, // 剩余奖品数
    ordered: false, // 已预约
    can: false,  // 能抽
    timecount: 0,  // 倒计时
    saveImg: '',
    imgs: imgs,  // 待加载的图片
    hasPrize: false, // 已中奖
    qrcode: null,   // 中奖二维码
    take: false, // 是否已核销
    hasNext: true,  // 是否还有下一场
    card: false,  // 添加到卡包
    previewDeny: false, // 是否禁用了保存到相册
  },
  onLoad: function() {
    this.posting = false;
    app.getWindow(res => {
      this.setData({
        winW: res.windowWidth,
        winH: res.windowHeight,
      })
    });
  },
  onShow: function() {
    if (this.data.page.save) return
    this.main(null, false);
  },
  main: function (callback, hasToast = true) {
    !hasToast && wx.showLoading({ mask: true });
    wx.setScreenBrightness({
      value: .6,
    });
    // 登录与授权
    app.login(code => {
      app.getInfo(res => {
        mainInfo = res
        userInfo = res.userInfo
        post.entry(code, res, this.main_entry)
        wx.hideLoading();
        wx.stopPullDownRefresh();
        callback && callback();
        if (thingsOk) thingsOk();
        thingsOk = this.imgsLoaded;
      })
    })
  },
  // 转发
  onShareAppMessage: function() {
    return {
      title: '0元？0元！青浦奥莱圣诞0元秒杀真的来了！',
      path: '/pages/index/index',
      imageUrl: '/img/share-img.jpg',
    }
  },
  // 下拉刷新
  onPullDownRefresh: function(){
    this.main();
  },
  // 入口数据处理
  main_entry: function(r) {
    // 入口数据初始化
    var r = r.data;
    UnionId = r.UserGuid;
    this.data.can = false;
    var list = r.ScreenList;
    // 已存在卡包
    this.data.card = r.AddCard;
    // 已中奖
    if (r.Bonus) {
      this.setData({
        can: false,
        card: this.data.card,
        qrcode: r.Bonus,
        hasPrize: true,
        disable: true,
        take: typeof r.Take == 'string',
      });
      this.page('good', true);
      return;
    }
    // 报错判断
    if (r.ErrorMessage && !this.error(r.ErrorMessage)) {
      this.setData({ disable: true });
      return
    }
    // 已预约
    this.data.ordered = r.Subscribe;
    // 如果 State 有为 true 的就是正在抽奖
    this.data.can = list.some(x => x.State);
    // 是否正在抽
    this.data.disable = list.some(x => x.State && x.Count < 1);
    // 本场还是下一场
    if (!this.data.can) {
      list = list.filter(x => x.SpanTime > 0);
      console.log('下一场', list[0])
      // 如果距离开场还有五分钟，全部禁用
      if (list[0].SpanTime < 10 * 60) {
        this.data.can = true;
        this.data.disable = true;
      }
    } else {
      list = list.filter(x => x.State);
      console.log('本场', list[0])
    }
    if (list[0]) {
      ScreenId = list[0].ScreenId;
      this.data.date = (list[0].ScreenId - 1) / 2 >> 0;
      this.data.time = (list[0].ScreenId - 1) % 2;
      this.data.count = list[0].Count;
      this.data.timecount = list[0].SpanTime;
    } else {
      wx.showModal({
        content: '活动已结束',
        showCancel: false,
      })
    }
    // 修改数据
    this.setData({
      can: this.data.can,
      date: this.data.date,
      time: this.data.time,
      count: this.data.count,
      disable: this.data.disable,
      ordered: this.data.ordered,
      timecount: this.data.timecount,
    });
    // 开启倒计时
    this.data.timecount > 0 && this.timecount();
    // 开启置顶倒计时
    if (this.topBarTimer == undefined) {
      this.topBarTime();
      this.topBarTimer = setInterval(() => {
        this.topBarTime();
      }, 5500);
    } else {

    }
  },
  // 倒计时
  timecount: function(){
    clearInterval(this.countTimer);
    this.countTimer = setInterval(() => {
      this.setData({ timecount: --this.data.timecount });
      if (this.data.can && this.data.disable && this.data.timecount < 1) {
        clearInterval(this.countTimer);
        // this.setData({ can: true });
        this.main();
      }
    }, 1000);
  },
  topBarTime: function () {
    var time = this.data.timecount, tip = '';
    if (time < 0) tip = '奥特莱斯圣诞秒杀';
    else tip = '距离秒杀开始还有' + (time / 3600 >> 0) + '时' + (time % 3600 / 60 >> 0) + '分' + (time % 60) + '秒',
    wx.setTopBarText({
      text: tip,
      // success: res => {
      //   console.log('设置置顶消息', res)
      // },
      // dail: err => {
      //   console.log('设置置顶消息-报错', err)
      // }
    })
  },
  //-------------------------- 预约
  notice: function (e) {
    var formId = e.detail.formId;
    console.log('formId', formId);
    if (!this.hasFormId(formId)) return;
    // this.setData({ btnLoading: true })
    wx.showLoading({ mask: true })
    if (this.posting) return;
    this.posting = true;
    post.notice(ScreenId, UnionId, formId, res => {
      wx.hideLoading()
      this.posting = false;
      if (res.State) {
        this.setData({
          ordered: true,
          // btnLoading: false
        })
      } else {
        wx.showModal({
          content: res.ErrorMessage,
          showCancel: false,
        });
      }
    })
  },
  //-------------------------- 预约下一场
  noticeNext: function (e) {
    var formId = e.detail.formId;
    console.log('formId', formId);
    if (!this.hasFormId(formId)) return;
    this.setData({ btnLoading: true })
    if (this.posting) return;
    this.posting = true;
    if (++thisScreen > 6) return;
    post.notice(thisScreen, UnionId, formId, res => {
      this.setData({ btnLoading: false })
      this.posting = false;
      if (res.State) {
        this.data.page.bad = false;
        this.setData({
          page: this.data.page,
          ordered: true,
        })
      } else {
        wx.showModal({
          content: res.ErrorMessage,
          showCancel: false,
        })
      }
    })
  },
  //-------------------------- 抽奖
  prize: function(e) {
    var formId = e.detail.formId;
    console.log('formId', formId);
    if (!this.hasFormId(formId)) return;
    // wx.showLoading({ title: '秒杀中...', mask: true })
    wx.showLoading({ mask: true });
    thisScreen = ScreenId;
    if (this.posting) return;
    this.posting = true;
    post.prize(ScreenId, UnionId, formId, res => {
      this.posting = false;
      // wx.hideLoading()
      // console.log(res.State, res.Bonuses, res.BonusState)
      this.main(() => {
        if (!res.State) {
          this.page('bad', true);
        }
      });
      // if (res.State && res.Bonuses) {
        // this.setData({
        //   qrcode: res.Bonuses[0].Qrcode,
        //   hasPrize: true,
        // });
        // this.main();
      // } else if (!res.State) {
      //   this.page('bad', true);
        // if (res.BonusState == 901) {
        //   wx.showModal({
        //     content: res.ErrorMessage,
        //     showCancel: false,
        //   });
        // }
        // this.noticeNext();
      // }
    })
  },
  //-------------------------- 保存 formId
  saveFormId: function (e) {
    var formId = e.detail.formId;
    console.log('formId', formId);
    if (!formId || /formId/.test(formId)) return;
    post.save(UnionId, formId, res => {
      res.State && console.log('存储 formId 成功');
    })
  },
  //-------------------------- 添加到卡包
  addCard: function () {
    wx.showLoading({ mask: true })
    if (this.posting) return;
    this.posting = true;
    if (!UnionId) return;
    post.card(UnionId, res => {
      wx.hideLoading()
      this.posting = false;

      // this.setData({
      //   card: res.State
      // })
      // console.log('asda',res)
      this.main(null, false)
    })
  },
  //---------------------------- 图片加载 与 canvas 绘制
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
    thingsOk = null;
  },
  // canvas 绘制
  canvas: function (callback) {
    // 如果已产生，不再新建
    var img = wx.getStorageSync('saveImg');
    // if (img) {
    //   console.log('图片生成-缓存', img)
    //   callback && callback(img)
    //   return;
    // }
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
          img = res.tempFilePath
          wx.setStorageSync('saveImg', img)
          callback && callback(img)
        }
      })
    }, 500)
  },
  //------------------------------------ 页面处理函数
  pageRule: function () {
    this.page('rule', !this.data.page.rule);
  },
  showSave: function () {
    wx.showLoading();
    if (!this.data.saveImg) {
      wx.showToast({
        title: '保存图片失败',
      })
      return;
    }
    wx.saveImageToPhotosAlbum({
      filePath: this.data.saveImg,
      complete: res => {
        wx.hideLoading();
        if (/deny/.test(res.errMsg)) this.setData({ previewDeny: true })
        this.data.page.save = true;
        this.setData({ page: this.data.page })
      }
    })
  },
  closeSave: function () {
    this.page('save', false);
  },
  showGood: function () {
    if (!this.data.qrcode) {
      wx.showModal({
        content: '您还没中奖',
        showCancel: false,
      })
      return;
    } else {
      this.page('good', true);
    }
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
  // 图片相册预览
  previewSave: function () {
    wx.previewImage({
      urls: [this.data.saveImg],
    })
  },
  // 二维码相册预览
  previewQrcode: function () {
    wx.setScreenBrightness({
      value: 1,
    });
    wx.previewImage({
      urls: [this.data.qrcode],
      complete: res => {
        console.log('图片预览', res)
      }
    });
  },
  error: function(ErrCode) {
    var tip = '', ifContinue = true;
    switch (ErrCode) {
      case 897: tip = '抽奖活动已结束'; ifContinue = false; break;
      case 898: tip = '系统错误'; ifContinue = false; break;
      case 899: tip = '身份错误'; ifContinue = false; break;
      case 900: tip = '已经中奖'; break;
      case 901: tip = '已超过当天抽奖次数'; break;
      case 902: tip = '奖品已发完'; break;
      case 903: tip = '中奖数量已达上限'; break;
      case 904: tip = '已中奖，明天再来吧'; break;
    }
    wx.showModal({
      content: tip,
      showCancel: false,
    })
    return ifContinue;
  },
  hasFormId: function (formId) {
    if (!formId || /formId/.test(formId)) {
      wx.showModal({
        content: '获取 formId 失败',
        showCancel: false,
      }); return false;
    }
    return true;
  },
  prevent: function() {
    return false;
  }
})