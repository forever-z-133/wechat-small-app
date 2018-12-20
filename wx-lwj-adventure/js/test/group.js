import Player from './index'
import Box from './shape'
import Sprite from '../base/sprite'
import DataBus from '../databus'

const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

// 玩家相关常量设置
const PLAYER_WIDTH = 80
const PLAYER_HEIGHT = 80

let databus = new DataBus();

const temp = {};

export default class Group extends Sprite {
  constructor() {
    super();

    this.child = [
      new Player(),
      new Box(),
    ];

    this.dirX = 1;
    this.dirY = 1;

    this.calculateNewPosition();
    console.log(this.constructor.toString().includes('Group'))
  }

  // 计算本元素组的盒子模式，确保元素组包含着所有元素
  calculateNewPosition() {
    const first = this.child[0];
    let minx = first.x, miny = first.y, maxr = minx + first.width, maxb = miny + first.height;
    this.child.slice(1).forEach((item) => {
      if (item.x < minx) minx = item.x;
      if (item.y < miny) miny = item.y;
      if (item.x + item.widht > maxr) maxr = item.x + item.width;
      if (item.y + item.height > maxb) maxb = item.y + item.height;
    });
    this.x = minx;
    this.y = miny;
    this.width = maxr - this.x;
    this.height = maxb - this.y;
  }

  // 重写绘制方法
  drawToCanvas(ctx) {
    if (!this.visible) return;

    ctx.strokeStyle = 'green';
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    
    this.child.forEach((item) => {
      item.drawToCanvas(ctx);
    });
  }

  run() {
    if (this.x <= 0) {
      this.dirX = 1;
    }
    if (this.x + this.width >= screenWidth) {
      this.dirX = -1;
    }

    if (this.y <= 0) {
      this.dirY = 1;
    }
    if (this.y + this.height >= screenHeight) {
      this.dirY = -1;
    }

    this.x += this.dirX * 5;
    this.y += this.dirY * 5;
    this.child.forEach((item) => {
      item.x += this.dirX * 5;
      item.y += this.dirY * 5;
    });
  }
}