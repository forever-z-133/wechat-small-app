import Block from '../../base/block';

import HeadImage from './headImage.js';
import TotalMonney from './totalMoney.js';
import AddItemNum from './addItemNum.js';
import UserGoldConfig from './userGoldConfig.js';

import { px } from '../../libs/utils.js';

export default class Header extends Block {
  constructor() {
    super(0, 0, px(750), px(160));

    const headImage = new HeadImage();
    const totalMoney = new TotalMonney();
    const addItemNum = new AddItemNum();
    // const userGoldConfig = new UserGoldConfig();

    this.addChild('headImage', headImage);
    this.addChild('addItemNum', addItemNum);
    this.addChild('totalMoney', totalMoney);
    // this.addChild('userGoldConfig', userGoldConfig);

    this.initChildChange(this);

    this.bgColor = 'grey';
  }
}