import Sprite from '../base/sprite'

import { border2json } from '../libs/utils.js';

// 把 fill 和 stroke 的部分拆出来，我也不知道这样好不好
class Shape extends Sprite {
  constructor(...args) {
    super(...args);
  }
  customDrawToCanvas(ctx) {
    const { x, y, width, height, color, bgColor, border } = this;
    const { width: borderWidth, style: borderStyle, color: borderColor } = border2json(border);
    ctx.save();
    ctx.beginPath();
    this.customDrawShape(ctx);
    ctx.fillStyle = color || bgColor;
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    borderStyle !== 'solid' && oGc.setLineDash([borderWidth, borderWidth]);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  customDrawShape(ctx) {

  }
}

// 圆角方形
export class Rect extends Shape {
  constructor(x, y, width, height, radius) {
    super(x, y, width, height);
    this.radius = radius;
  }
}

// 椭圆
export class Ellipse extends Rect {
  constructor(x, y, width, height) {
    super(x, y, width, height, 9999);
  }
}

// 圆形
export class Circle extends Shape {
  constructor(x, y, radius) {
    super(x, y, radius, radius);
  }
  customDrawShape(ctx) {
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
  }
}

// 正多边形
export class Isogon extends Shape {
  // sides=边数  size=中心到顶点的距离  groove=中心到内侧顶点的距离（比如五角星）
  constructor(x, y, sides, size, groove) {
    super(x, y, size, 0);
    // 比如正六边形宽高不一致，还需另算
    this.sides = sides;
    this.size = size;
    this.groove = groove;
  }
}