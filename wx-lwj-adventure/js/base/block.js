import Group from '../base/group'

import { watchValueChange, px } from '../libs/utils.js';

export default class Block extends Group {
  constructor(x, y, width, height) {
    super();

    // Group 组件是贴合子组件宽高的，Block 的宽高是固定的，即贴合后直接覆盖 Group 宽高即可
    this.raw = { x, y, width, height };
  }

  constomAfterCalculateNewPosition() {
    const { x, y, width, height } = this.raw;
    this.x = x; this.y = y; this.width = width; this.height = height;
  }
}