import Sprite from '../base/sprite'
import DataBus from '../databus'

const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

// 玩家相关常量设置
const PLAYER_WIDTH = 80
const PLAYER_HEIGHT = 80

let databus = new DataBus()

export default class Box extends Sprite {
  constructor() {
    super('', PLAYER_WIDTH, PLAYER_HEIGHT)

    // 玩家默认处于屏幕底部居中位置
    this.x = screenWidth / 2 - this.width / 2 - 50;
    this.y = screenHeight - this.height - 150;
  }

  // 重写绘制方法
  draw(ctx) {
    if (!this.visible) return;
    ctx.fillStyle = 'red';
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }
}