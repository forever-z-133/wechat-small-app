// pages/share/index.js
import { alert, getValueFromUrl, getShareParams } from '../../utils/util.js';
import post from '../../utils/post.js';
import {default_qrcode, url2, url3 } from './qrcode.js';

const app = getApp();
let ctx = null;

Page({
  data: {
  },
  onLoad: function (options) {
    var from = getValueFromUrl('from', options);
    if (!from) return alert('缺少邀请参数');
    from = decodeURIComponent(from);
    from = from.replace('#wechat_redirect', '');
    var json = app.createShareData(from);
    this.sharaJson = json;
    console.log(json);

    // 获取 canvas 宽高
    wx.getSystemInfo({
      complete: win => {
        if (!/ok$/i.test(win.errMsg)) return alert('无法生成分享图');
        this.winW = (win.windowWidth || 414) * 0.8;
        this.winH = 844 / 560 * this.winW;

        // 开始画图
        this.getImg((img, cache) => {
          console.log('生成分享图', cache?'缓存':'', img);
          this.shareImg = img;
        });
      },
    })
  },
  onShareAppMessage: function (options) {
    var json = this.sharaJson;
    if (app.data.usid) json.path += '&usid=' + app.data.usid;
    console.log('转发出去的链接', json.path);
    return json;
  },
  onUnload: function () {
    ctx = null;
  },
  onHide: function() {
    ctx = null;
  },


  /**************************************
   * 
   * 以下为生成分享图的过程
   * getImg -> drawImg -> preloadSource -> createImg -> saveImg
   * 
   **************************************/
  getImg: function (callback) {
    this.drawImg(callback, false);
  },
  drawImg: function (callback) {
    ctx = ctx || wx.createCanvasContext('img');
    wx.showLoading();
    this.preloadSource(source => {
      this._draw(ctx, source);
      setTimeout(() => {
        this._draw(ctx, source, () => {
          this.createImg(img => {
            wx.hideLoading();
            callback && callback(img);
          });
        })
      }, 1000);
    });
  },
  _draw(ctx, source, callback) {
    var winW = this.winW, winH = this.winH;
    var px = winW / 560;
    var l = 144 * px >> 0, t = 467 * px >> 0, w = 273 * px >> 0;
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
    // 二维码部分
    ctx.setFillStyle('#fff');
    ctx.fillRect(l, t, w, w);
    var pos = { left: l + 16 * px, top: t + 16 * px, width: w - 32 * px, height: w - 32 * px };
    ctx.drawImage(source.qrcode.path, pos.left, pos.top, pos.width, pos.height);
    // 绘制
    ctx.draw(true, callback);
  },
  preloadSource: function (callback) {
    var source = {
      bg: '../../images/share-bg.jpg',
    }
    var res = {}, i = -1;
    this.getQrcode(qrcode => {
      source.qrcode = qrcode;
      var keys = Object.keys(source);
      (function _load() {
        if (++i >= keys.length) {
          return callback && callback(source);
        }
        var key = keys[i];
        if (/^http/.test(source[key])) {
          wx.downloadFile({
            url: source[key],
            complete: res => {
              if (!/ok$/.test(res.errMsg)) { wx.hideLoading(); return wx.showModal({ content: res.errMsg }); }
              res.path = res.tempFilePath || source[key];
              source[key] = res;
              _load.call(this);
            }
          });
        } else {
          wx.getImageInfo({
            src: source[key],
            complete: res => {
              if (!/ok$/.test(res.errMsg)) { wx.hideLoading(); return wx.showModal({ content: res.errMsg }); }
              res.path = source[key];
              source[key] = res;
              _load.call(this);
            }
          });
        }
      }.bind(this))()
    })
  },
  getQrcode: function (callback) {
    var data = this.sharaJson.raw;
    post.getQrcode(data, res => {
      callback && callback(res);
    });
  },
  createImg: function (callback) {
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: this.winW * 2,
      height: this.winH * 2,
      destWidth: this.winW,
      destHeight: this.winH,
      canvasId: 'img',
      complete: function (res) {
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