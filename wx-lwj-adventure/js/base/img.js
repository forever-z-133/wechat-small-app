import Sprite from './sprite.js';

import { px, watchValueChange, boxGrowUp } from '../libs/utils.js';

export default class Img extends Sprite {
  constructor(imgSrc, x, y, width, height) {
    super(x, y, width, height);

    // 绑定数值联动
    watchValueChange(this, 'imgSrc', val => {
      const img = new Image();
      img.src = imgSrc;
      img.onload = () => {
        this.imgWidth = img.width;
        this.imgHeight = img.height;
        this.img = img;
      }
      img.onerror = (err) => {
        console.log(err);
      }
    });
    ['width', 'height', 'size'].forEach(key => {
      watchValueChange(this, key, (val) => {
        const { newImgWidth, newImgHeight } = this.getImgRealSize();
        this.newImgWidth = newImgWidth;
        this.newImgHeight = newImgHeight;
      });
    });
    watchValueChange(this, 'position', (val) => {
      const { newImgX, newImgY } = this.getImgPosition();
      this.newImgX = newImgX;
      this.newImgY = newImgY;
    });

    // 其他重要赋值
    this.imgSrc = imgSrc;
    this.size = '50% 50%';  // 切记 size 的赋值需在 position 之前
    this.position = 'left top';
    this.repeat = 'no-repeat';
  }

  customDrawToCanvas(ctx) {
    const { img, x, y, width, height, bgColor } = this;
    const { newImgX, newImgY, newImgWidth, newImgHeight } = this;
    if (!img) return;

    ctx.save();

    ctx.fillStyle = bgColor;
    ctx.rect(x, y, width, height);
    // ctx.clip 会有闪动，也无法做移动的效果，
    // 但 source-atop 如果要裁剪又必须得有背景色，这谁顶得住呀
    ctx.globalCompositeOperation = 'source-atop';
    ctx.drawImage(img, newImgX, newImgY, newImgWidth, newImgHeight);
    this.drawNoreRepeat(ctx);
    ctx.globalCompositeOperation = 'source-over';

    ctx.restore();
  }

  /**
   * 计算图片实际宽高，比如 full cover contian 或者 50 10%
   */
  getImgRealSize() {
    const { width, height, imgWidth, imgHeight, size } = this;
    let newImgWidth = 0, newImgHeight = 0;

    const ratio = width / height;
    const imgRatio = imgWidth / imgHeight;
    if (size === 'full') {
      newImgWidth = width;
      newImgHeight = height;
    } else if (size === 'contain') { // 让图片短边与容器贴合，长边超出
      if (ratio > imgRatio) {
        newImgHeight = height;
        newImgWidth = newImgHeight * imgRatio;
      } else {
        newImgWidth = width;
        newImgHeight = newImgWidth / imgRatio;
      }
    } else if (size === 'cover') { // 让图片长边与容器贴合，短边留白
      if (ratio < imgRatio) {
        newImgHeight = height;
        newImgWidth = newImgHeight * imgRatio;
      } else {
        newImgWidth = width;
        newImgHeight = newImgWidth / imgRatio;
      }
    } else {  // 让图片保存定值或百分比
      const temp = size.split(' ');
      if (temp.length === 1) temp.concat(temp);
      if (temp.length === 0) temp.splice(0, 1, 0, 0);

      temp.forEach((item, index) => {
        let value = 0;
        if (/\d+%/.test(item)) { value = width * parseFloat(item) / 100; }
        else { value = parseFloat(item); }  // 包括 px 哟
        index === 0 ? (newImgWidth = value) : (newImgHeight = value);
      });
    }

    return { newImgWidth, newImgHeight };
  }

  /**
   * 计算图片实际位置，比如 left center top right 或者 50 10% 等
   */
  getImgPosition() {
    const { x, y, width, height, newImgWidth, newImgHeight, position } = this;
    let newImgX = 0, newImgY = 0;
    
    const temp = position.split(' ');
    if (temp.length === 0) return { newImgX: 0, newImgY: 0 };
    if (temp.length === 1) temp.push('center');  // 只传入一个时，另一个默认为 center
    if ((temp[0] === 'top' || temp[0] === 'bottom')) temp.reverse();  // 把 top bottom 放到后面去
    if ((temp[1] === 'left' || temp[1] === 'right')) temp.reverse();  // 如果 left right 在后面则调到前面
    
    temp.forEach((item, index) => {
      var value = 0;
      if (item === 'top') value = y;
      else if (item === 'bottom') value = y + height - newImgHeight;
      else if (item === 'left') value = x;
      else if (item === 'right') value = x + width - newImgWidth;
      else if (item === 'center' && index === 0) value = x + width / 2 - newImgWidth / 2;
      else if (item === 'center' && index === 1) value = y + height / 2 - newImgHeight / 2;
      else if (/\d+%/.test(item)) { value = (index === 0 ? x : y) + width * parseFloat(item) / 100; }
      else { value = (index === 0 ? x : y) + parseFloat(item); }  // 包括 px 哟
      index === 0 ? (newImgX = value) : (newImgY = value);
    });

    return { newImgX, newImgY };
  }

  /**
   * 绘制更多重复图片
   */
  drawNoreRepeat(ctx) {
    const { img, x, y, width, height, repeat } = this;
    const { newImgX, newImgY, newImgWidth, newImgHeight } = this;

    if (repeat === 'repeat-x') {
      
    }
  }
}
