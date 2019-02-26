import Sprite from '../../base/sprite.js';

import { px } from '../../libs/utils.js';

export default class Player extends Sprite {
  constructor() {
    super(px(30), px(20), px(130), px(130))
    
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

  draw(ctx) {
    ctx.fillStyle = '#fff';
    const { x, y, width, height } = this;
    ctx.fillRect(x, y, width, height);
  }
}
