import Group from '../../base/group.js';
import Text from '../../base/text.js';

import { px, watchValueChange } from '../../libs/utils.js';

export default class TotalMoney extends Group {
  constructor(text = '', maxWidth, textWrap) {
    super()

    const unit = new Text('$');
    const value = new Text(text, maxWidth, textWrap);

    this.addChild('unit', unit);
    this.addChild('value', value);

    this.initChildChange(this);

    this.unit = unit;

    watchValueChange(this, 'fontSize', (val) => {
      unit.fontSize = val * 0.6;
      unit.y = this.y + this.height - unit.fontSize;
      value.fontSize = val;
    });
    watchValueChange(this, 'color', (val) => {
      unit.color = val;
      value.color = val;
    });
    // watchValueChange(this, 'x', (val) => {
    //   value.x = val + 10;
    // });
  }

  customDrawToCanvas(ctx) {
    const { x, y, width, height, fontSize } = this;

    // this.unit.fontSize = fontSize * 0.5;
    // this.unit.y = y + this.unit.fontSize;

    // this.x = x + this.unit.fontSize;
  }
}
