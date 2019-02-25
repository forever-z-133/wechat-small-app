
/**
 * 莫名不能根据 arguments.length 来判断，
 */
export const distence = (x1, y1, x2, y2) => {
  if (x2 === undefined && y2 === undefined) {
    return Math.abs(x1 - y1);
  }
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(x2 - y2, 2));
}

/**
 * 动画，以后应该会改进，加个 TODO
 */
let animTimer = null;
export const anim = function(start, to, duration, callback) {
  if (duration === 0) {
    return callback && callback(to, 1);
  }

  var time = Date.now();
  animTimer && window.cancelAnimationFrame(animTimer);
  
  (function run() {
    var per = Math.min(1, (Date.now() - time) / duration);
    if (per >= 1) return callback && callback(to, 1);
    var now = start + (to - start) * per;
    callback && callback(now, per);
    animTimer = window.requestAnimationFrame(run);
  })();
}

/**
 * 扩大容器对象尺寸
 */
export const boxGrowUp = (obj, gap) => {
  let { x, y, width, height } = obj;
  x -= gap; y -= gap; width += gap * 2; height += gap * 2;
  return { x, y, width, height };
}

export const px2rem = (windowWidth, designWidth) => {
  var ratio = designWidth / windowWidth;
  return function(px) {
    return Number((px * ratio).toFixed(2));
  }
}

/**
 * 获取文本真实宽度
 */
export const getTextWidth = (text = '', fontSize = 16, ctx) => {
  if (!text) return 0;

  if (ctx) return ctx.measureText(text).width; // 小游戏的 measureText 莫名不准
  
  return text.split('').reduce((re, char) => {
    const ratio = char.codePointAt() > 128 ? 1 : 0.24;
    return re + fontSize * ratio >> 0;
  }, 0);
}