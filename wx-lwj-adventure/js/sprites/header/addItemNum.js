import Sprite from '../../base/sprite.js';

import { fontFamily } from '../../libs/config.js';
import gameConfig from '../../gameData/index.js';
const winW = window.innerWidth;

export default class AddItemNumConfig extends Sprite {
  constructor() {
    super()

    this.y = 40;
    this.width = 50;
    this.height = 20;
    this.x = winW - this.width - 20;

    this.bindEvent();
  }

  bindEvent() {
    canvas.addEventListener('touchstart', this.click);
  }

  click = (e) => {
    e = e.touches ? e.touches[0] : e;
    const clickInner = this.checkIsOnThisSprite(e.pageX, e.pageY);
    if (clickInner) {
      const { _addItemNum: now, _addItemNumConfig: temp } = gameConfig;
      gameConfig._addItemNum = temp[temp.indexOf(now) + 1] || temp[0];
    }
  }

  beforeDraw(ctx) {
    const { x, y, width, height } = this;
    const { _addItemNum } = gameConfig;
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'red';
    ctx.font = `${height}px / 1 ${fontFamily}`;
    ctx.fillText(`${_addItemNum}`, x, y);
  }
}