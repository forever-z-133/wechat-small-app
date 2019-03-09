import Group from '../../base/group.js';
import Img from '../../base/img.js';

import { px } from '../../libs/utils.js';

export default class Aside extends Group {
  constructor() {
    super();

    const __bg = new Img(bgSrc, 0, 0, px(600), winH);
    const __itemList = new ItemList();
    __itemList.y = px(160);

    this.addChild('bg', __bg);
    this.addChild('itemList', __itemList);

    this.initChildChange(this);
  }
}