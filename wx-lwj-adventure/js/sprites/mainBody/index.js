import Scroller from '../../base/scroller.js';

import ItemList from './itemList.js';
// import TotalMonney from './totalMoney.js';
// import AddItemNum from './addItemNum.js';
// import UserGoldConfig from './userGoldConfig.js';

import { boxGrowUp } from '../../libs/utils.js';

const winW = window.innerWidth;
const winH = window.innerHeight;

export default class MainBody extends Scroller {
  constructor() {
    super(winH - 100);

    this.x = 0;
    this.y = 60;
    this.width = winW;

    const itemList = new ItemList();

    // this.addChild('itemList', itemList);

    this.initChildChange(this);
  }

  beforeDraw(ctx) {
    // const { x, y, maxWidth: width, maxHeight: height } = this.options;
    // console.log(x, y, width, height);
    // const { x, y, width, height } = boxGrowUp(this, 10);
    // ctx.save();
    // ctx.fillStyle = '#514A44';
    // ctx.fillRect(0, 0, winW, height);
    // ctx.restore();
  }
}