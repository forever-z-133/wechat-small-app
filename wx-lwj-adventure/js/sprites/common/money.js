import Group from '../../base/group.js';
import Text from '../../base/text.js';

import { px, watchValueChange } from '../../libs/utils.js';

export default class TotalMoney extends Group {
  constructor(text = '', maxWidth, textWrap) {
    super()

    // const unit = new Text('$');
    const value = new Text(text, maxWidth, textWrap);

    // this.addChild('unit', unit);
    this.addChild('value', value);

    this.initChildChange(this);

    watchValueChange(this, 'fontSize', (val) => {
      // unit.fontSize = val * 0.7;
      // console.log(val)
      value.fontSize = val;
      // this.height = value.height;
      // this.width = value.width;
    });
    // watchValueChange(this, 'color', (val) => {
    //   unit.color = val;
    //   value.color = val;
    // });
    // watchValueChange(this, 'x', (val) => {
    //   unit.x = val;
    //   value.x = val + unit.width;
    // });
  }
}
