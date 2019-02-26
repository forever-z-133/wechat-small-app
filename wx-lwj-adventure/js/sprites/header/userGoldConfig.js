import Sprite from '../../base/sprite.js';
import Group from '../../base/group.js';
import Text from '../../base/text.js';

import { fontFamily } from '../../libs/config.js';
import gameConfig from '../../gameData/index.js';
const winW = window.innerWidth;

class TotalMoneyItem extends Group {
  constructor(options) {
    super()

    const { label, value, color } = options;
    
    const labelDom = new Text(label);
    labelDom.x = 80;
    labelDom.y = 40;
    // labelDom.fontSize = 50;
    labelDom.color = color;

    window.test(1, labelDom.lineHeight);

    // const valueDom = new Text(value, 100);
    // valueDom.x = 200;
    // valueDom.y = 40;
    // valueDom.color = '#fff';

    this.addChild('label', labelDom);
    // this.addChild('value', valueDom);

    this.initChildChange(this);

    this.options = options;
  }

  beforeDraw(ctx) {
    if (!this.options) return;
  }
}

export default class TotalMoney extends Group {
  constructor() {
    super()

    const goldOptions = { label: '金', value: 0, color: 'gold', index: 0 }
    const gold = new TotalMoneyItem(goldOptions);
    this.addChild('gold',  gold);

    this.initChildChange(this);
  }
}
