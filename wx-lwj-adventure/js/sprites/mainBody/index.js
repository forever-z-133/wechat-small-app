import Scroller from '../../base/scroller.js';

import ItemList from './itemList.js';
// import TotalMonney from './totalMoney.js';
// import AddItemNum from './addItemNum.js';
// import UserGoldConfig from './userGoldConfig.js';

import { px, boxGrowUp } from '../../libs/utils.js';

const winW = window.innerWidth;
const winH = window.innerHeight;

export default class MainBody extends Scroller {
  constructor() {
    super(winH - px(300));

    const itemList = new ItemList();

    this.addChild('itemList', itemList);

    this.initChildChange(this);
  }

  beforeDraw(ctx) {
    const { x, y, width, height } = this.options;
    ctx.fillStyle = 'pink';
    ctx.fillRect(x, y, width, height);
  }
}