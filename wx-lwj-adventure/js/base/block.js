import Sprite from '../base/sprite'

import { watchValueChange } from '../libs/utils.js';

const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

let KeyMap = {};

export default class Group extends Sprite {
  constructor() {
    super();

    this.child = [];
  }

  //------------ 绑定值的联动
  initChildChange(that) {
    ['x', 'y'].forEach(key => {
      watchValueChange(this, key, (val, old) => {
        const offset = val - old;
        this.child.forEach(item => item[key] += offset);
      });
    });
    ['disabled', 'visible'].forEach(key => {
      watchValueChange(this, key, (val) => {
        this.child.forEach(item => item[key] = val);
      });
    });
  }

  //------------ 增删子元素
  addChild(key, el) {
    if (key in KeyMap) {
      this.removeChild(key);
    }
    this.child.push(el);
    KeyMap[key] = el;
    this.calculateNewPosition();
  }
  removeChild(key) {
    this.child = this.child.filter((item) => {
      return KeyMap[key] !== item;
    });
    delete KeyMap[key];
    this.calculateNewPosition();
  }
  emptyChild() {
    this.child = [];
    KeyMap = {};
    this.calculateNewPosition();
  }
}