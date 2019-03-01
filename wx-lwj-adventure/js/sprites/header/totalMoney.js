import Money from '../common/money.js';

import { px } from '../../libs/utils.js';

export default class TotalMoney extends Money {
  constructor() {
    super('万岁0afg$万恶没有英文𠮷', px(200), false)
    console.log(px(200))

    this.x = px(180);
    this.y = px(20);
    this.fontSize = 50;
    this.color = 'red';
  }
  afterDraw(ctx) {
    const { x, y, width, height } = this;
    ctx.strokeStyle = 'red';
    ctx.strokeRect(x, y, width, height);
  }
}
