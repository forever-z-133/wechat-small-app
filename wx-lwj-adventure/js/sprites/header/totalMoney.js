import Money from '../common/money.js';

import { px } from '../../libs/utils.js';

export default class TotalMoney extends Money {
  constructor() {
    super('0.00', px(400), false)

    this.x = px(180);
    this.y = px(20);
    this.fontSize = 25;
  }

  draw(ctx) {
    // const { x, y, width, height } = this;
    // ctx.textBaseline = 'top';
    // ctx.fillStyle = 'green';
    // ctx.font = `${height}px / 1 ${fontFamily}`;
    // ctx.fillText('$0.00', x, y);
  }
}
