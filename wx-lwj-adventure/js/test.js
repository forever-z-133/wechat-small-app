import Player from './test/index'
import Box from './test/shape'
import Box1 from './test/box1'
import Scroller from './base/scroller'
import DataBus from './databus'
import EventBus from './base/eventbus'
import TestScroller from './test/testScroller.js'
import Header from './sprites/header/index'
import MainBody from './sprites/mainBody/index'

let ctx = canvas.getContext('2d')
let databus = new DataBus()
let eventbus = new EventBus()

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
    // this.player = new Player();
    // this.box = new Box();
    // this.panel = new Box1();
    // this.scroller = new Scroller(300);
    // this.TestScroller = new TestScroller(300);
    this.Header = new Header();
    this.MainBody = new MainBody();

    // 清除上一局的动画
    window.cancelAnimationFrame(this.Timer);
    this.Timer = window.requestAnimationFrame(this.loop.bind(this), canvas)
  }

  // 重绘 canvas
  render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // this.player.drawToCanvas(ctx); // 图片
    // this.box.drawToCanvas(ctx);    // 图形
    // this.panel.drawToCanvas(ctx);  // 元素组
    // this.scroller.drawToCanvas(ctx); // 滑动容器
    // this.TestScroller.drawToCanvas(ctx);
    this.MainBody.drawToCanvas(ctx);
    this.Header.drawToCanvas(ctx);
  }

  // 游戏逻辑更新主函数
  update() {
    if ( databus.gameOver ) return;

    // this.panel.run();
  }

  // 实现游戏帧循环
  loop() {
    databus.frame++;
    this.update();
    this.render();
    this.Timer = window.requestAnimationFrame(this.loop.bind(this), canvas);
  }
}
