import Sprite from '../../base/sprite.js';

import { fontFamily } from '../../libs/config.js';
import { px } from '../../libs/utils.js';
const winW = window.innerWidth;

export default class TotalMoney extends Sprite {
  constructor() {
    super()

    this.x = 80;
    this.y = px(200);
    this.width = 260;
    this.height = 20;
  }

  beforeDraw(ctx) {
    const { x, y, width, height } = this;
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'green';
    ctx.font = `${height}px / 1 ${fontFamily}`;
    ctx.fillText('$0.00', x, y);
  }
}
