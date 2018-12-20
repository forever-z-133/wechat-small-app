import Player from './test/index'
import Box from './test/shape'
import Group from './test/group'
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
    this.player = new Player();
    this.box = new Box();
    this.group = new Group();

    // 清除上一局的动画
    window.cancelAnimationFrame(this.Timer);
    this.Timer = window.requestAnimationFrame(this.loop.bind(this), canvas)
  }

  // 重绘 canvas
  render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    this.player.drawToCanvas(ctx);
    this.box.drawToCanvas(ctx);
    this.group.drawToCanvas(ctx);
  }

  // 游戏逻辑更新主函数
  update() {
    if ( databus.gameOver ) return;

    this.group.run();
  }

  // 实现游戏帧循环
  loop() {
    databus.frame++;
    this.update();
    this.render();
    this.Timer = window.requestAnimationFrame(this.loop.bind(this), canvas);
  }
}
