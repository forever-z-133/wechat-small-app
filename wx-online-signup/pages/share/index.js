// pages/share/index.js
import { alert } from '../../utils/util.js';

let ctx = null;

Page({
  data: {
  },
  onLoad: function (options) {
    this.shareImg = wx.getStorageSync('shareImg');
    wx.clearStorageSync();

    // 获取 canvas 宽高
    wx.getSystemInfo({
      complete: win => {
        console.log('系统', win);
        if (!/ok$/i.test(win.errMsg)) return alert('无法生成分享图');
        this.winW = win.windowWidth * 0.8;
        this.winH = 844 / 560 * this.winW;

        // 开始画图
        this.getImg((img, cache) => {
          console.log('生成分享图', cache?'缓存':'', img);
          this.shareImg = img;
          // wx.setStorageSync('shareImg', img);
        });
      },
    })
  },
  onShareAppMessage: function (options) {
    var url = '/pages/index/index';
    return {
      title: '一起来报班学习吧！',
      path: url,
      imageUrl: '../../images/share.jpg',
    }
  },


  /**************************************
   * 
   * 以下为生成分享图的过程
   * getImg -> drawImg -> preloadSource -> createImg -> saveImg
   * 
   **************************************/
  getImg: function (callback) {
    // if (this.shareImg) {
    //   return callback && callback(this.shareImg, true);
    // }
    this.drawImg(callback, false);
  },
  drawImg: function (callback) {
    ctx = ctx || wx.createCanvasContext('img');
    wx.showLoading();
    this.preloadSource(source => {
      this._draw(ctx, source);
      setTimeout(() => {
        this._draw(ctx, source);
        this.createImg(img => {
          wx.hideLoading();
          callback && callback(img);
        });
      }, 500);
    });
  },
  _draw(ctx, source) {
    var winW = this.winW, winH = this.winH;
    var px = winW / 560;
    var l = 144 * px, t = 467 * px, w = 273 * px;
    // 背景色
    ctx.setFillStyle('#5891FE');
    ctx.fillRect(0, 0, winW, winH);
    // 背景图
    ctx.drawImage(source.bg.path, 0, 0, winW, winH);
    // 下方字（center 有时无效）
    ctx.setFontSize(28 * px);
    ctx.setFillStyle('#ffffff');
    ctx.fillText('识别邀请二维码进入小程序', 112 * px, winH - 28 * px);
    // 圆角白框（round 有时无效）
    ctx.setStrokeStyle('#ffffff');
    ctx.lineJoin = "round";
    ctx.lineWidth = 16 * px;
    ctx.strokeRect(l, t, w, w);
    ctx.fillRect(l, t, w, w);
    ctx.drawImage(source.qrcode.path, l + 16 * px, t + 16 * px, w - 32 * px, w - 32 * px);
    // 绘制
    ctx.draw();
  },
  preloadSource: function (callback) {
    var source = {
      bg: '../../images/share-bg.jpg',
    }
    var res = {}, i = -1;
    var keys = Object.keys(source);
    (function _load() {
      if (++i >= keys.length) {
        return this.getQrcode(qrcode => {
          source.qrcode = { path: qrcode || '../../images/qrcode.jpg' };
          callback && callback(source);
        })
      }
      var key = keys[i]
      wx.getImageInfo({
        src: source[key],
        complete: res => {
          res.path = source[key];
          source[key] = res;
          _load.call(this);
        }
      });
    }.bind(this))()
  },
  getQrcode: function (callback) {
    callback && callback()
  },
  createImg: function (callback) {
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: this.winW * 2,
      height: this.winH * 2,
      destWidth: this.winW * 2,
      destHeight: this.winH * 2,
      canvasId: 'img',
      complete: function (res) {
        console.log('生成图片',  res);
        if (!/ok$/.test(res.errMsg)) alert(res.errMsg);
        callback && callback(res.tempFilePath);
      }
    })
  },
  saveImg: function () {
    if (!this.shareImg) return alert('图片还没生成好');
    wx.saveImageToPhotosAlbum ? wx.saveImageToPhotosAlbum({
      filePath: this.shareImg,
      complete: res => {
        if (/deny/i.test(res.errMsg)) return this.saveError();
        if (!/ok$/i.test(res.errMsg)) return this.saveError();
        wx.showToast({ title: '保存成功' });
      }
    }) : this.saveError()
  },
  showImg: function () {
    if (!this.shareImg) return alert('图片还没生成好');
    wx.previewImage({
      urls: [this.shareImg],
    });
  },
  saveError: function() {
    wx.showModal({
      title: '保存失败',
      content: '用长按保存到相册吧',
      showCancel: false,
      success: () => {
        this.showImg();
      },
    });
  },
})