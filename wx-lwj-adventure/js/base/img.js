import Sprite from './sprite.js';

export default class Img extends Sprite {
  constructor(imgSrc, x, y, width, height, x2, y2, width2, height2) {
    super();

    this.img = new Image();
    this.img.src = imgSrc;
  }

  customDrawToCanvas(ctx) {
    const { img, x, y, width, height } = this;
    if (!img) return;

    ctx.drawImage(img, x, y, width, height);
  }
}
