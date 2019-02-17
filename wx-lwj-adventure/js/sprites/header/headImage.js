import Sprite from '../../base/sprite.js';

const winW = window.innerWidth;

export default class Player extends Sprite {
  constructor() {
    super()

    this.x = 20;
    this.y = 10;
    this.width = 50;
    this.height = 50;

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

  beforeDraw(ctx) {
    ctx.fillStyle = '#fff';
    const { x, y, width, height } = this;
    ctx.fillRect(x, y, width, height);
  }
}
