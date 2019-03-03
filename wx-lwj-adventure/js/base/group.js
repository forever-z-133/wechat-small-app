import Sprite from '../base/sprite'

import { watchValueChange, boxGrowUp } from '../libs/utils.js';

let KeyMap = {};

export default class Group extends Sprite {
  constructor() {
    super();

    this.child = [];

    this.frozen = false;
  }
  
  //------------ 绑定值的联动
  initChildChange (that) {
    ['x', 'y'].forEach(key => {
      watchValueChange(this, key, (val, old) => {
        const offset = val - old;
        this.child.forEach(item => item[key] += offset);
      }, 0);
    });
    ['disabled', 'visible'].forEach(key => {
      watchValueChange(this, key, (val) => {
        this.child.forEach(item => item[key] = val);
      });
    });
    // 改父级宽高，子级宽高的变化需是等比的，之后再搞
    // 如果正在运动中，进行盒子模式计算是有误的，还没想好怎么弄
  }

  //------------ 计算本元素组的盒子模式，确保元素组包含着所有元素
  calculateNewPosition() {
    const first = this.child[0] || {};
    let minx = first.x, miny = first.y, maxr = minx + first.width, maxb = miny + first.height;
    this.child.slice(1).forEach((item) => {
      if (item.x < minx) minx = item.x;
      if (item.y < miny) miny = item.y;
      if (item.x + item.width > maxr) maxr = item.x + item.width;
      if (item.y + item.height > maxb) maxb = item.y + item.height;
    });
    this.x = minx;
    this.y = miny;
    this.width = maxr - this.x;
    this.height = maxb - this.y;
    this.afterCalculateNewPosition(this);
  }
  afterCalculateNewPosition() {}

  //------------ 增删子元素
  addChild (key, el) {
    if (key in KeyMap) {
      this.removeChild(key);
    }
    this.child.push(el);
    KeyMap[key] = el;
    this.calculateNewPosition();
  }
  removeChild (key) {
    this.child = this.child.filter((item) => {
      return KeyMap[key] !== item;
    });
    delete KeyMap[key];
    this.calculateNewPosition();
  }
  emptyChild () {
    this.child = [];
    KeyMap = {};
    this.calculateNewPosition();
  }

  customDrawToCanvas2(ctx) {
    this.child.forEach(item => item.drawToCanvas(ctx));
  }
}