import Group from '../base/group'

import { distence, anim } from '../libs/utils.js'

const winW = window.innerWidth
const winH = window.innerHeight

// 反转
function reverseEase(y) {
  return 1 - Math.sqrt(1 - y * y);
}

export default class Scroller extends Group {
  constructor(maxHeight, options) {
    super();

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
    anim(this.y, top, duration, (now) => this.y = now );
  }
  scrollLeft(top, duration, easing) {
    anim(this.x, top, duration, (now) => this.x = now);
  }

  // ---------- 接触滑动容器
  // 方法1，与 save restore 有点难封装
  customDrawToCanvas(ctx) {
    const { x, y, maxWidth: width, maxHeight: height } = this.options;
    ctx.fillRect(x, y, width, height);
    ctx.globalCompositeOperation = "source-atop";
  }
  customDrawToCanvas2(ctx) {
    this.child.forEach(item => item.drawToCanvas(ctx));
    ctx.globalCompositeOperation = "source-over";
  }
  // // 方法2，除本组件外其他组件都没了，故不适用
  // afterDraw(ctx) {
  //   const { x, y, maxWidth: width, maxHeight: height } = this.options;
  //   // console.log(x, y, width, height)
  //   ctx.globalCompositeOperation = "destination-in";
  //   ctx.fillStyle = '#fff';
  //   ctx.fillRect(x, 50, width, height);
  //   ctx.globalCompositeOperation = "source-over";
  // }
}