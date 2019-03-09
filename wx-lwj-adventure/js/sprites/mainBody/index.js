import Scroller from '../../base/scroller.js';
import Img from '../../base/img.js';

import ItemList from './itemList.js';

import { px, boxGrowUp } from '../../libs/utils.js';
const bgSrc = 'imgs/bg.png';

const winW = window.innerWidth;
const winH = window.innerHeight;

export default class MainBody extends Scroller {
  constructor() {
    super(winH - px(160) - px(100));

    const __bg = new Img(bgSrc, 0, 0, px(600), winH);
    const __itemList = new ItemList();
    __itemList.y = px(160);

    this.addChild('bg', __bg);
    this.addChild('itemList', __itemList);

    this.initChildChange(this);
  }
}