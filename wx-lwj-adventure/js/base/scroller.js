import Group from '../base/group'

import TWEEN from '../libs/tween.js'
import { distence, anim } from '../libs/utils.js'

const winW = window.innerWidth
const winH = window.innerHeight

export default class Scroller extends Group {
  constructor(maxHeight, options) {
    super();

    this.maxHeight = maxHeight || winH;

    this.options = {
      min: 0,
      max: this.height,

    }

    this.x = 50;
    this.y = 50;
    this.width = winW - 100;
    this.height = winH - 100;

    this.clicked = false;
    this.moveing = false;
    this.start = {};
    this.last = {};

    this.bindEvent();
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
      this.moveing = dist > 5;
      return;
    }

    // 开始滑动
    const x = this.x + e.pageX - this.last.x;
    const y = this.y + e.pageY - this.last.y;

    this.scrollLeft(x, 0);
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

    const current = -1 * this.y, max = winH - 50, min = 50
    if (current >= max) {
      this.scrollTop(max, 600);
    } else if (current <= min) {
      this.scrollTop(min, 600);
    }
    //  else {
    //   nt = Date.now() - st;
    //   // 划得特别快，则计算加速度，不快就随意啦
    //   if (nt < 300) {
    //     // 此算法来自于 https://github.com/AlloyTeam/AlloyTouch
    //     var distance = opt.vertical ? ny - sy : nx - sx;
    //     var speed = distance / nt;
    //     var destination = current + (speed * speed) / (2 * 0.006) * (distance < 0 ? -1 : 1);
    //     var tRatio = 1;
    //     if (destination < min) {
    //       if (destination < min - 600) {
    //         tRatio = reverseEase((current - min + 60) / (current - destination));
    //         destination = min - 60;
    //       } else {
    //         tRatio = reverseEase((current - min + 60 * (min - destination) / 600) / (current - destination));
    //         destination = min - 60 * (min - destination) / 600;
    //       }
    //     } else if (destination > max) {
    //       if (destination < max + 600) {
    //         tRatio = reverseEase((max + 60 - current) / (destination - current));
    //         destination = max + 60;
    //       } else {
    //         tRatio = reverseEase((max + 60 * (destination - max) / 600 - current) / (destination - current));
    //         destination = max + 60 * (destination - max) / 600;
    //       }
    //     }
    //     var duration = Math.round(speed / 0.006) * tRatio;
    //     // if (opt.topStop) {
    //     //     if (current >= max) return;
    //     // }
    //     if ((current >= max && opt.topStop) || (current <= min && opt.bottomStop)) return;
    //     _to(Math.round(destination), Math.abs(duration), ease);
    //   } else _transitionEnd()
    // }
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
    ctx.fillStyle = 'lightblue';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  draw(ctx) {
    TWEEN.update();
  }
}