import Sprite from '../../base/sprite.js';

import { fontFamily } from '../../libs/config.js';
import gameConfig from '../../gameData/index.js';
const winW = window.innerWidth;

export default class TotalMoney extends Sprite {
  constructor() {
    super()

    this.x = 80;
    this.width = 260;
    this.height = 16;
    this.y = 60 - this.height;
  }

  beforeDraw(ctx) {
    const { x, y, width, height } = this;
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'green';
    ctx.font = `${height}px / 1 ${fontFamily}`;
    ctx.fillText('$0.00', x, y);
  }
}
