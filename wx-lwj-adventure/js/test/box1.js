import Player from './index'
import Box from './shape'
import Group from '../base/group'

const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

export default class Box1  extends Group {
  constructor() {
    super();
    
    const box = new Box();
    box.x = 10; box.y = 10;
    this.addChild('fly', new Player());
    this.addChild('box', box);

    this.initChildChange(this);

    this.dirX = 1;
    this.dirY = 1;
  }

  // 重写绘制方法
  beforeDraw (ctx) {
    ctx.strokeStyle = 'green';
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }

  run() {
    if (this.frozen) return;

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
  }
}