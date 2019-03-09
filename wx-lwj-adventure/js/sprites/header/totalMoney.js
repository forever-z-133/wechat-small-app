import Group from '../../base/group.js';
import Text from '../../base/text.js';

import { px, money } from '../../libs/utils.js';
import gameConfig from '../../gameData/index.js';

export default class TotalMoney extends Group {
  constructor() {
    super()

    let { _total: text } = gameConfig;

    const __unit = new Text('$');
    __unit.x = px(180);
    __unit.y = px(20);
    __unit.fontSize = 25;
    __unit.color = '#fff';
    const __value = new Text(money(text), px(400), false);
    __value.x = px(180) + __unit.width + px(10);
    __value.y = px(20);
    __value.fontSize = 25;
    __value.color = '#fff';

    this.addChild('unit', __unit);
    this.addChild('value', __value);
    this.__value = __value;

    this.initChildChange(this);
  }

  beforeDraw() {
    let { _total } = gameConfig;
    gameConfig._total = _total;
    this.__value.text = money(_total);
  }
}
