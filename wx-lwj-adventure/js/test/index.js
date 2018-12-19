import Sprite from '../base/sprite'
import DataBus from '../databus'

const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

// 玩家相关常量设置
const PLAYER_IMG_SRC = 'images/hero.png'
const PLAYER_WIDTH = 80
const PLAYER_HEIGHT = 80

let databus = new DataBus()

export default class Player extends Sprite {
  constructor() {
    super(PLAYER_IMG_SRC, PLAYER_WIDTH, PLAYER_HEIGHT)

    // 玩家默认处于屏幕底部居中位置
    this.x = screenWidth / 2 - this.width / 2;
    this.y = screenHeight - this.height - 30;

    this.bindEvent();
  }
  bindEvent() {
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault()
      let x = e.touches[0].clientX
      let y = e.touches[0].clientY
      if (this.checkIsOnThisSprite(x, y)) {
        this.touched = true
        this.setPosition(x, y)
      }
    });
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault()
      let x = e.touches[0].clientX
      let y = e.touches[0].clientY
      if (this.touched) this.setPosition(x, y)
    });
    canvas.addEventListener('touchend', (e) => {
      e.preventDefault()
      this.touched = false
    });
  }
  setPosition (x, y) {
    let disX = x - this.width / 2;
    let disY = y - this.height / 2;

    // 元素不得超出屏幕
    const maxW = screenWidth - this.width;
    const maxH = screenHeight - this.height;
    disX = Math.max(0, Math.min(disX, maxW));
    disY = Math.max(0, Math.min(disY, maxH));

    this.x = disX;
    this.y = disY;
  }
}
