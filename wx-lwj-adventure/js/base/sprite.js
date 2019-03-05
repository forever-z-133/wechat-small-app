/**
 * 游戏基础的精灵类
 */

import { boxGrowUp } from '../libs/utils.js';

export default class Sprite {
  constructor(x = 0, y = 0, width = 0, height = 0) {
    
    this.width  = width;
    this.height = height;
    this.x = x;
    this.y = y;

    this.bgColor = 'rgba(255, 255, 255, 0)';
    this.visible = true;
    this.disabled = false;
  }

  /**
   * 将精灵图绘制在canvas上
   */
  customDrawToCanvas(ctx) { }
  customDrawToCanvas2(ctx) { }
  beforeDraw(ctx) { }
  afterDraw(ctx) { }
  drawToCanvas(ctx) {
    if (!this.visible) return;

    ctx.save();
    this.drawBgColor(ctx);
    ctx.restore();

    ctx.save();
    this.beforeDraw(ctx);
    ctx.restore();

    this.customDrawToCanvas(ctx);
    ctx.save();
    this.draw && this.draw(ctx);
    ctx.restore();
    this.customDrawToCanvas2(ctx);

    ctx.save();
    this.afterDraw(ctx);
    ctx.restore();
  }
  drawBgColor(ctx) {
    const { padding = [], bgColor } = this;
    const { x, y, width, height } = boxGrowUp(this, ...padding);
    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, width, height);
  }

  /**
   * 判断手指是否在飞机上
   * @param {Number} x: 手指的X轴坐标
   * @param {Number} y: 手指的Y轴坐标
   * @param {Number} deviation: 点击范围扩充
   * @return {Boolean}: 用于标识手指是否在飞机上的布尔值
   */
  checkIsOnThisSprite(x, y, deviation = 0) {
    return !!(x >= this.x - deviation
      && y >= this.y - deviation
      && x <= this.x + this.width + deviation
      && y <= this.y + this.height + deviation)
  }

  /**
   * 简单的碰撞检测定义：
   * 另一个精灵的中心点处于本精灵所在的矩形内即可
   * @param{Sprite} sp: Sptite的实例
   */
  isCollideWith(sp, deviation = 0) {
    if (!this.visible || !sp.visible) return false

    let spX = sp.x + sp.width / 2;
    let spY = sp.y + sp.height / 2;

    return this.checkIsOnThisSprite(spX, spY, deviation);
  }
}
