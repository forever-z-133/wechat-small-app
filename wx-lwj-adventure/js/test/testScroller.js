import Scroller from '../base/scroller.js';
import Box from './shape'


export default class TestScroller extends Scroller {
  constructor(maxHeight, options) {
    super();

    const box = new Box();
    box.height = 3000;
    this.addChild('box', box);

    this.initChildChange(this);

    console.log(this);
  }
}