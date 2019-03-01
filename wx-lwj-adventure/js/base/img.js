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

    // 其他重要赋值
    this.imgSrc = imgSrc;
    this.position = 'left top';
    this.repeat = 'no-repeat';
    this.size = 'full';
  }

  customDrawToCanvas(ctx) {
    const { img, x, y, newImgWidth, newImgHeight } = this;
    if (!img) return;

    ctx.drawImage(img, x, y, newImgWidth, newImgHeight);
  }
  beforeDraw(ctx) {
    const { x, y, width, height } = boxGrowUp(this);
    ctx.fillRect(x, y, width, height);
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
}
