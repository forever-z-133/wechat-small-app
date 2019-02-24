import Sprite from './sprite.js';

import { fontFamily } from '../libs/config.js';
import { getTextWidth } from '../libs/utils.js'

export default class Text extends Sprite {
  constructor(text, maxWidth = Infinity, textWrap = false) {
    /* 注：maxWidth 不可为 null */
    super();

    this.text = text;
    this.maxWidth = maxWidth; // 超出时使用 ... 
    this.textWrap = textWrap; // 超出是否换行，做不到很好的 justify 哟

    this.color = this.color || '#000';
    this.fontSize = this.fontSize || 16;
    this.lineHeight = this.fontSize * 1.3;
  }

  /**
   * 分三种文本绘制
   * 1. 普通
   * 2. 超出不换行的
   * 3. 超出换行的
   */
  customDrawToCanvas(ctx) {
    const { x, y, fontSize, lineHeight, maxWidth, textWrap, color } = this;
    let { width, height, text } = this;
    const realWidth = getTextWidth(text, fontSize);

    ctx.textBaseline = 'top';
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px / ${lineHeight} ${fontFamily}`;

    if (realWidth < maxWidth) { // 普通
      this.width = width = realWidth;
      this.height = height = lineHeight;
      ctx.fillText(text, x, y);
    } else if (textWrap !== true) { // 超出不换行的
      this.width = maxWidth;
      this.height = height = lineHeight;
      this.drawSingleLineText(ctx, text, maxWidth, x, y);
    } else if (textWrap === true) { // 超出换行的
      this.width = maxWidth;
      const line = (realWidth / maxWidth >> 0) + 1;
      this.height = height = lineHeight * line;
      this.drawMultiLineText(ctx, text, maxWidth, x, y);
    }
  }

  /**
   * 绘制单行文本
   */
  drawSingleLineText(ctx, text = '', maxWidth = 0, x = 0, y = 0) {
    if (!ctx || !text) return 0;

    const { fontSize } = this;
    let str = '';

    for (let char of text) {
      const width = getTextWidth(str + char + '...', fontSize);
      if (width >= maxWidth) {
        str += '...'; break;
      }
      str += char
    }

    ctx.fillText(str, x, y);
  }

  /**
   * 绘制多行文本
   */
  drawMultiLineText(ctx, text = '', maxWidth = 0, x = 0, y = 0) {
    if (!ctx || !text) return 0;

    const { fontSize, lineHeight } = this;
    const re = []; // 每行文本的数据

    for (let char of text) {
      let item = re.slice(-1)[0];
      if (!item) item = { text: '', width: 0 }
      const realCharWidth = getTextWidth(char, fontSize);
      if (item.width + realCharWidth <= maxWidth) {
        item.text += char;
        item.width += realCharWidth;
        re.splice(-1, 1, item);
      } else {
        item = { text: char, width: realCharWidth }
        re.push(item);
      }
    }

    const textAlign = this.textAlign || ctx.textAlign;
    re.forEach((item, index) => {
      switch (textAlign) {
        case 'center': ctx.fillText(item.text, x + maxWidth / 2 - item.width / 2, y + index * lineHeight); break;
        case 'right': ctx.fillText(item.text, x + maxWidth - item.width, y + index * lineHeight); break;
        case 'left': default: ctx.fillText(item.text, x, y + index * lineHeight);
      }
    });
  }
}
