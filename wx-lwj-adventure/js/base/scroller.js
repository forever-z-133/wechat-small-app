import Group from '../base/group'

const winW = window.innerWidth
const winH = window.innerHeight

export default class Scroller extends Group {
  constructor(maxHeight) {
    super();

    this.maxHeight = maxHeight || winH;

    this.x = 50;
    this.y = 50;
    this.width = winW - 100;
    this.height = winH - 100;

    this.clicked = false;
    this.moveing = false;
    this.start = {};

    this.bindEvent();
  }

  bindEvent() {
    canvas.addEventListener('touchstart', this.touchstart);
    canvas.addEventListener('touchmove', this.touchmove);
    canvas.addEventListener('touchend', this.touchend);
  }

  touchstart = (e) => {
    e = e.touches ? e.touches[0] : e;
    const clickInner = this.checkIsOnThisSprite(e.pageX, e.pageY);
    if (clickInner !== true) return;  // 没点中
    this.clicked = true;
    this.start.x = e.pageX;
    this.start.y = e.pageY;
  }
  touchmove = (e) => {
    if (!this.clicked) return;
    e = e.touches ? e.touches[0] : e;
    if (!this.moveing) {
      const dist = this.distence(this.start.x, this.start.y, e.pageX, e.pageY);
      this.moveing = dist > 5; return;
    }
    console.log('开始滑动了')
  }
  touchend = () => {
    if (!this.clicked) return;
    if (!this.moveing) return;
  }

  distence(x1, y1, x2, y2) {
    if (arguments.length === 2) {
      return Math.abs(x1 - y1);
    }
    if (arguments.length === 4) {
      return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(x2 - y2, 2));
    }
  }
  
  beforeDraw(ctx) {
    ctx.fillStyle = 'lightblue';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}