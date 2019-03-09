import Group from '../../base/group.js';
import Block from '../../base/block.js';
import Img from '../../base/img.js';
import Text from '../../base/text.js';
import { Circle } from '../../base/shape.js';

import { px, money } from '../../libs/utils.js';
import gameConfig from '../../gameData/index.js';

class Item extends Block {
  constructor(config, value) {
    super(0, 0, px(550), px(150));
    
    const __left = new Group();

    const __circle = new Circle(0, 0, px(60));
    __circle.bgColor = 'red';
    const __icon = new Img(config.icon, 0, 0, __circle.width, __circle.height);

    __left.addChild('circle', __circle);
    __left.addChild('icon', __icon);

    __left.initChildChange(__left);

    this.addChild('left', __left);

    this.initChildChange(this);
    this.x = px(30);
    this.y += (this.height + px(20)) * (config.index) + px(50);
  }
}


export default class itemList extends Group {
  constructor() {
    super()

    const { _itemConfig } = gameConfig;
    for (var i = 0; i < _itemConfig.length; i++) {
      const config = _itemConfig[i];
      const item = new Item(config);

      this.addChild('item' + i, item);
    }

    this.initChildChange(this);
  }
}
