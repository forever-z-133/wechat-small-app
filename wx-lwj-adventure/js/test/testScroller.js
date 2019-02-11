import Scroller from '../base/scroller.js';
import Box from './shape'


export default class TestScroller extends Scroller {
  constructor(maxHeight, options) {
    super(maxHeight, options);

    const box = new Box();
    box.height = 500;
    box.y = 50;
    this.addChild('box', box);

    this.initChildChange(this);
    console.log(this);
  }

  afterDraw(ctx) {
    if (!this.options) return;
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 5;
    ctx.strokeRect(this.options.x - 2, this.options.y - 2, this.options.maxWidth + 4, this.options.maxHeight+4);
  }
}