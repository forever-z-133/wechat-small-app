import Block from '../base/block';
import Img from '../base/img';

import { px } from '../libs/utils.js';
const winH = window.innerHeight;
const bgSrc = 'imgs/bg.png';

export default class Header extends Block {
  constructor() {
    super(0, 0, px(750), winH);

    const __bg = new Img(bgSrc, 0, 0, px(750), winH);
    __bg.bgColor = '#fff';
    this.addChild('bg', __bg);

    this.initChildChange(this);
  }
}