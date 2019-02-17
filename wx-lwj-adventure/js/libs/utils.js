export const distence = (x1, y1, x2, y2) => {
  // if (arguments.length === 2) {
  //   return Math.abs(x1 - y1);
  // }
  // if (arguments.length === 4) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(x2 - y2, 2));
  // }
}

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

// 扩大容器对象尺寸
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