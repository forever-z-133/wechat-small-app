import Group from '../../base/group';

import HeadImage from './headImage.js';
import TotalMonney from './totalMoney.js';
import AddItemNum from './addItemNum.js';
import UserGoldConfig from './userGoldConfig.js';

import { boxGrowUp, px } from '../../libs/utils.js';

const winW = window.innerWidth;

export default class Header extends Group {
  constructor() {
    super();

    const headImage = new HeadImage();
    const totalMoney = new TotalMonney();
    const addItemNum = new AddItemNum();
    const userGoldConfig = new UserGoldConfig();

    this.addChild('headImage', headImage);
    this.addChild('totalMoney', totalMoney);
    this.addChild('addItemNum', addItemNum);
    this.addChild('userGoldConfig', userGoldConfig);

    this.initChildChange(this);
  }

  beforeDraw(ctx) {
    ctx.fillStyle = '#514A44';
    ctx.fillRect(0, 0, px(750), px(180));
  }
}