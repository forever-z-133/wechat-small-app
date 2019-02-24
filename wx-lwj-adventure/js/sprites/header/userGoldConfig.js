import Sprite from '../../base/sprite.js';
import Group from '../../base/group.js';
import Text from '../../base/text.js';

import { fontFamily } from '../../libs/config.js';
import gameConfig from '../../gameData/index.js';
const winW = window.innerWidth;

class TotalMoneyItem extends Group {
  constructor(options) {
    super()

    const { label, value } = options;
    // const temp = { '金': 0, '银': 0, '铜': 0 };
    // const index = temp[label];
    // this.x = 80 + index * 80;
    // this.width = 260 / 3 * (index + 1) >> 0;
    // this.height = 16;
    // this.y = 45 - this.y;

    const labelDom = new Text(label);
    labelDom.x = 80;
    labelDom.y = 40;
    labelDom.fontSize = 16;
    labelDom.lineHeight = 16 * 1.3;
    labelDom.color = 'gold';

    this.addChild('x', labelDom);

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

    const goldOptions = { label: '金', value: 0 }
    const gold = new TotalMoneyItem(goldOptions);
    this.addChild('gold',  gold);

    this.initChildChange(this);

    // this.x = 80;
    // this.width = 260;
    // this.height = 16;
    // this.y = 60 - this.height;
  }

  beforeDraw(ctx) {
    // const { x, y, width, height } = this;
    // ctx.textBaseline = 'top';
    // ctx.fillStyle = 'green';
    // ctx.font = `${height}px / 1 ${fontFamily}`;
    // ctx.fillText('$0.00', x, y);
  }
}
