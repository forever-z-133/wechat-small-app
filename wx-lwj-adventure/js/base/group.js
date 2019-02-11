import Sprite from '../base/sprite'

const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

let KeyMap = {};

export default class Group extends Sprite {
  constructor() {
    super();

    this.child = [];

    this.frozen = false;
  }
  
  //------------ 绑定值的联动
  initChildChange (that) {
    const temp = {}, proxy = {};
    ['x', 'y'].forEach((key) => {
      temp[key] = that[key] || 0;
      // 父级值变动，触发 proxy 变动，即子级的变动
      Object.defineProperty(that, key, {
        set (val) { proxy[key] = val; return val; },
        get () { return proxy[key]; }
      });
      // 子级的数值变动
      Object.defineProperty(proxy, key, {
        set(val) {
          const offset = val - temp[key];
          that.child.forEach((item) => { item[key] += offset; });
          temp[key] = val;
        },
        get() { return temp[key] }
      });
    });
    // 改父级宽高，子级宽高的变化需是等比的，之后再搞
    // 如果正在运动中，进行盒子模式计算是有误的，还没想好怎么弄
    // disable 和 visible 等更多玩意暂时不管
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

  //------------ 禁用元素，元素禁用则不可触发事件
  disable () {
    this.child.forEach((item) => {
      this.disable = true;
    });
  }
  enable() {
    this.child.forEach((item) => {
      this.disable = false;
    });
  }
}