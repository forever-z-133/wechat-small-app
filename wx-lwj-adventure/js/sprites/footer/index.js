import Group from '../../base/group.js';
import Block from '../../base/block.js';
import Img from '../../base/img.js';
import Text from '../../base/text.js';

import { px } from '../../libs/utils.js';
const winH = window.innerHeight;

export default class Footer extends Block {
  constructor() {
    super(0, winH - px(100), px(750), px(100))

    this.addChild('btnMenu', new Text(''));
    this.initChildChange(this);

    this.y = winH - px(100);

    this.bgColor = '#38190D';
  }
}
