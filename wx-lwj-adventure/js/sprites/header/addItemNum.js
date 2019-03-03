import Group from '../../base/group.js';
import Text from '../../base/text.js';

import { fontFamily } from '../../libs/config.js';
import { px } from '../../libs/utils.js';
import gameConfig from '../../gameData/index.js';
const winW = window.innerWidth;

export default class AddItemNumConfig extends Group {
  constructor() {
    super()

    const { _addItemNum } = gameConfig;
    const __text = new Text(_addItemNum, px(100));
    __text.x = px(750 - 20) - __text.width;
    __text.y = px(100);
    __text.textAlign = 'right';
    this.addChild('text', __text);
    this.__text = __text;

    this.initChildChange(this);

    this.bgColor = 'pink'

    this.bindEvent();
  }

  bindEvent() {
    canvas.addEventListener('touchstart', this.click);
  }

  click = (e) => {
    e = e.touches ? e.touches[0] : e;
    const clickInner = this.checkIsOnThisSprite(e.pageX, e.pageY);
    if (!clickInner) return;

    const { _addItemNum: now, _addItemNumConfig: temp } = gameConfig;
    var newValue = temp[temp.indexOf(now) + 1] || temp[0];
    this.__text.text = newValue;
    gameConfig._addItemNum = newValue;
  }
}