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
    let from = getValueFromUrl('from', options);
    if (!from) return alert('缺少邀请参数');
    from = decodeURIComponent(from);
    const json = app.createShareData(from);
    if (!json.raw.token) return alert('token 丢失，请重新登录');
    this.sharaJson = json;

    // 获取 canvas 宽高
    wx.getSystemInfo({
      complete: win => {
        if (!/ok$/i.test(win.errMsg)) return alert('无法生成分享图');
        this.winW = (win.windowWidth || 414);
        this.winH = (win.windowHeight || 736);

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
    var px = winW / 750;
    this.px = px;
    // 背景色
    ctx.setFillStyle('#fff');
    ctx.fillRect(0, 0, winW, winH);
    // 背景图
    ctx.drawImage(source.head.path, 0, 0, winW, 543 * px);
    // 二维码
    var pos = { width: winW * 0.7, height: winW * 0.7 };
    pos.top = winH / 2 - winH * 0.05 * px;
    pos.left = winW / 2 - pos.width / 2 * px;
    ctx.drawImage(source.qrcode.path, pos.left, pos.top, pos.width * px, pos.height * px);
    // 下方字
    ctx.setFontSize(26 * px);
    ctx.setFillStyle('#7F7F7F');
    ctx.fillText('识别邀请二维码进入小程序', winW / 2 - 26 * 6 * px, pos.top + pos.height * px + 50 * px);
    // 绘制
    ctx.draw(true, callback);
  },
  preloadSource: function (callback) {
    var source = {
      bg: '../../images/share-bg.jpg',
      head: '../../images/share-head.png',
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
    const { identity = 'student' } = app.data.user || {};
    if (identity === 'student') {
      post.getNormalQrcode(data, res => {
        callback && callback(res);
      });
    } else {
      post.getUserQrcode(data, res => {
        callback && callback(res);
      });
    }
  },
  createImg: function (callback) {
    const px = this.px;
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: this.winW * 2,
      height: this.winH * 2,
      destWidth: this.winW,
      destHeight: this.winH * 0.75,
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