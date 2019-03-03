import Group from '../../base/group';

import HeadImage from './headImage.js';
import TotalMonney from './totalMoney.js';
import AddItemNum from './addItemNum.js';
import UserGoldConfig from './userGoldConfig.js';

import { px } from '../../libs/utils.js';

export default class Header extends Group {
  constructor() {
    super();

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