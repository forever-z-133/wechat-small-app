import Player from './test/index'
import DataBus from './databus'

let ctx = canvas.getContext('2d')
let databus = new DataBus()

/**
 * 游戏主函数
 */
export default class Main {
  constructor() {
    // 维护当前requestAnimationFrame的id
    this.Timer = 0;

    this.restart()
  }

  restart() {
    databus.reset();

    // 重建元素们
    this.player = new Player(ctx);

    // 清除上一局的动画
    window.cancelAnimationFrame(this.Timer);
    this.Timer = window.requestAnimationFrame(this.loop.bind(this), canvas)
  }

  // 重绘 canvas
  render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    this.player.drawToCanvas(ctx);
  }

  // 游戏逻辑更新主函数
  update() {
    if ( databus.gameOver ) return;
  }

  // 实现游戏帧循环
  loop() {
    databus.frame++;
    this.update();
    this.render();
    this.Timer = window.requestAnimationFrame(this.loop.bind(this), canvas);
  }
}
