import Group from '../../base/group.js';
import Img from '../../base/img.js';

import { px } from '../../libs/utils.js';

const url = 'images/enemy.png';

export default class Player extends Group {
  constructor() {
    super()

    const __img = new Img(url, px(30), px(20), px(130), px(130));

    this.addChild('img', __img);
    this.initChildChange(this);

    // const button = wx.createUserInfoButton({
    //   type: 'text',
    //   text: '获取用户信息',
    //   style: {
    //     left: px(30),
    //     top: px(20),
    //     width: px(130),
    //     height: px(130),
    //     backgroundColor: '#ff0000',
    //     color: '#ffffff',
    //     textAlign: 'center',
    //     fontSize: 16,
    //     borderRadius: 4
    //   }
    // })
    // button.onTap((res) => {
    //   console.log(res)
    // })
    
    this.bindEvent();
  }

  bindEvent() {
    canvas.addEventListener('touchstart', this.click);
  }

  click = (e) => {
    e = e.touches ? e.touches[0] : e;
    const clickInner = this.checkIsOnThisSprite(e.pageX, e.pageY);
    if (clickInner) {
      console.log('clicked');
    }
  }

  // draw(ctx) {
  //   ctx.fillStyle = '#fff';
  //   const { x, y, width, height } = this;
  //   ctx.fillRect(x, y, width, height);
  // }
}
