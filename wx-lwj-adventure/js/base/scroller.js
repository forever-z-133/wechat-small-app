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

    this.clicked = false;
    this.moveing = false;
    this.start = {};
    this.last = {};

    this.bindEvent();
  }

  afterCalculateNewPosition() {
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
    if (!this.clicked) return;
    if (!this.moveing) return;

    const { minHeight: min, maxHeight, height } = this.options;
    const max = maxHeight + min - height;
    
    if (this.y > min) {
      this.scrollTop(min, 300);
    } else if (this.y < max) {
      this.scrollTop(max, 300);
    }
    else {
      let { x: sx, y: sy, time: st } = this.start;
      let { y: ny } = this.last;
      let current = this.y;
      let nt = 0;
      nt = Date.now() - st;
      // 划得特别快，则计算加速度，不快就随意啦
      if (nt < 300) {
        // 此算法来自于 https://github.com/AlloyTeam/AlloyTouch
        var distance = ny - sy;
        var speed = distance / nt;
        var destination = current + (speed * speed) / (2 * 0.006) * (distance < 0 ? -1 : 1);
        var tRatio = 1;
        console.log(current, min, max, destination, distance, speed);
        // if (destination < min) {
        //   if (destination < min - 600) {
        //     tRatio = reverseEase((current - min + 60) / (current - destination));
        //     destination = min - 60;
        //   } else {
        //     tRatio = reverseEase((current - min + 60 * (min - destination) / 600) / (current - destination));
        //     destination = min - 60 * (min - destination) / 600;
        //   }
        // } else if (destination > max) {
        //   if (destination < max + 600) {
        //     tRatio = reverseEase((max + 60 - current) / (destination - current));
        //     destination = max + 60;
        //   } else {
        //     tRatio = reverseEase((max + 60 * (destination - max) / 600 - current) / (destination - current));
        //     destination = max + 60 * (destination - max) / 600;
        //   }
        // }
        // console.log(speed, tRatio);
        // var duration = Math.round(speed / 0.006) * tRatio;
        // console.log(destination, duration);
        // if (opt.topStop) {
        //     if (current >= max) return;
        // }
        // if ((current >= max && opt.topStop) || (current <= min && opt.bottomStop)) return;
        // _to(Math.round(destination), Math.abs(duration), ease);
      } else { }
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
  beforeDraw(ctx) {
    // TODO: 使用 clip 会非常卡顿，不知该怎么弄
    // if (this.child.length > 0) {
    //   const { x, y, maxWidth: width, maxHeight: height } = this.options;
    //   // console.log(x, y, width, height)
    //   ctx.rect(x, y, width, height);
    //   ctx.clip();
    //   // ctx.restore();
    // }
  }
}