import Group from '../base/group'

import { distence, anim, watchValueChange, isTransparent } from '../libs/utils.js'

const winW = window.innerWidth
const winH = window.innerHeight

// 反转
function reverseEase(y) {
  return 1 - Math.sqrt(1 - y * y);
}

export default class Scroller extends Group {
  constructor(maxHeight, options) {
    super();

    ['x', 'y', 'width', 'maxHeight'].forEach(key => {
      watchValueChange(this, key, (val) => {
        this.afterCalculateNewPosition();
      });
    });

    this.maxHeight = maxHeight || winH;
    this.afterCalculateNewPosition();

    this.clicked = false;
    this.moveing = false;
    this.start = {};
    this.last = {};

    this.bindEvent();
  }

  afterCalculateNewPosition() {
    this.height = this.maxHeight;
    this.options = {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      minWidth: this.width,
      maxWidth: this.width,
      minHeight: this.y,
      maxHeight: this.maxHeight,
    }
  }

  bindEvent() {
    canvas.addEventListener('touchstart', this.touchstart);
    canvas.addEventListener('touchmove', this.touchmove);
    canvas.addEventListener('touchend', this.touchend);
  }

  // ---------- 接触滑动容器
  touchstart = (e) => {
    if (this.disabled) return;

    e = e.touches ? e.touches[0] : e;

    const clickInner = this.checkIsOnThisSprite(e.pageX, e.pageY);
    if (clickInner !== true) return; // 没点中
    this.clicked = true;

    this.start.x = e.pageX;
    this.start.y = e.pageY;
    this.start.time = Date.now();

    this.last.x = e.pageX;
    this.last.y = e.pageY;
  }

  // ---------- 开始滑动
  touchmove = (e) => {
    if (this.disabled) return;
    if (!this.clicked) return;

    e = e.touches ? e.touches[0] : e;

    // 不超过 5px 不算滑动
    if (!this.moveing) {
      const dist = distence(this.start.x, this.start.y, e.pageX, e.pageY);
      this.moveing = dist > 5; return;
    }

    // 开始滑动
    const x = this.x + e.pageX - this.last.x;
    const y = this.y + e.pageY - this.last.y;

    // this.scrollLeft(x, 0);
    this.scrollTop(y, 0);

    this.last.x = e.pageX;
    this.last.y = e.pageY;

    // 非急速短促的滑动不利于计算最终加速度
    if (Date.now() - this.start.time > 300) {
      this.start.time = Date.now();
    }
  }

  // ---------- 手势结束
  touchend = () => {
    if (this.disabled) return;
    if (!this.clicked) return;
    if (!this.moveing) return;

    this.start = {};
    this.last = {};

    const { minHeight: min, maxHeight, height } = this.options;
    const max = maxHeight + min - height;
    
    if (this.y > min) {
      this.scrollTop(min, 300);
    } else if (this.y < max) {
      this.scrollTop(max, 300);
    } else {
      // 弹性滑动还没开始搞
    }
  }

  // ---------- 手势结束后的减速和回弹
  brounceing() {

  }

  // ---------- 滑动至哪
  scrollTop(top, duration, easing) {
    const { y = 0 } = this;
    anim(y, top, duration, (now) => this.y = now );
  }
  scrollLeft(left, duration, easing) {
    const { x = 0 } = this;
    anim(x, left, duration, (now) => this.x = now);
  }

  // ---------- 接触滑动容器
  customDrawToCanvas(ctx) {
    const { bgColor } = this;
    const { x, y, maxWidth: width, maxHeight: height } = this.options;
    ctx.fillStyle = isTransparent(bgColor) ? '#fff' : bgColor; // 必须要有背景色
    ctx.fillRect(x, y, width, height);
    ctx.globalCompositeOperation = 'source-atop';
  }
  customDrawToCanvas2(ctx) {
    this.child.forEach(item => item.drawToCanvas(ctx));
    ctx.globalCompositeOperation = 'source-over';
  }
  drawBgColor(ctx) {}  // 覆盖原背景设置
}