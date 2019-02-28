import Money from '../common/money.js';

import { px } from '../../libs/utils.js';

export default class TotalMoney extends Money {
  constructor() {
    super('0.00万恶afgb𠮷', px(150), false)

    this.x = px(180);
    this.y = px(20);
    this.fontSize = 25;
    this.color = 'red';
  }
  afterDraw(ctx) {
    const { x, y, width, height } = this;
    ctx.strokeStyle = 'red';
    ctx.strokeRect(x, y, width, height);
  }
}
