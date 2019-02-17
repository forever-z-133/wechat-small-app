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
  }
}