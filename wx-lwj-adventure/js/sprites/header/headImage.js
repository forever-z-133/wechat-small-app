import Group from '../../base/group.js';
import Img from '../../base/img.js';

import { px } from '../../libs/utils.js';

const url = 'images/enemy.png';

export default class HeadImage extends Group {
  constructor() {
    super()

    const __img = new Img(url, px(30), px(20), px(120), px(120));
    // __img.bgColor = '#fff';
    this.addChild('img', __img);
    __img.size = '50% 50%';
    __img.position = '40 10';
    __img.repeat = 'repeat';
    __img.bgColor = '#fff';
    this.initChildChange(this);
    
    this.bindEvent();
  }

  bindEvent() {
    canvas.addEventListener('touchstart', this.clickedHeadImage);
  }

  // 如果没有用户信息，此处显示得为用户授权按钮
  initUserInfoAuth() {
    const button = wx.createUserInfoButton({
      type: 'text',
      text: '获取用户信息',
      style: {
        left: px(30),
        top: px(20),
        width: px(130),
        height: px(130),
        backgroundColor: '#ff0000',
        color: '#ffffff',
        textAlign: 'center',
        fontSize: 16,
        borderRadius: 4
      }
    })
    button.onTap((res) => {
      console.log(res)
    })
  }

  // 已有用户信息，并点中头像
  clickedHeadImage = (e) => {
    e = e.touches ? e.touches[0] : e;
    const clickInner = this.checkIsOnThisSprite(e.pageX, e.pageY);
    if (clickInner) {
      console.log('clicked');
    }
  }

  // 继承自 Group 的组件的 beforeDraw 不推荐加入 fillRect，
  // 不然会造成图片的截取的失效，很奇怪的问题
  // beforeDraw(ctx) {
  //   ctx.fillStyle = 'grey';
  //   ctx.fillRect(0, 0, px(750), px(150))
  // }
}
