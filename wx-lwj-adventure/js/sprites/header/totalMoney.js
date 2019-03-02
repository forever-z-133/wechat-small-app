import Group from '../../base/group.js';
import Text from '../../base/text.js';

import { px } from '../../libs/utils.js';

export default class TotalMoney extends Group {
  constructor() {
    super()

    const __value = new Text('0.00', px(400), false);
    __value.x = px(180);
    __value.y = px(20);
    __value.fontSize = 25;
    this.__value = __value;

    this.addChild('value', __value);

    this.initChildChange(this);
  }

  run() {
    this.__value.text = '0.02'
  }
}
