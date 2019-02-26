
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

/**
 * 将宽度转为其他比例计算，
 * 比如 px = px2rem(375, 750) 则可用 px(750) 的设计图尺寸得到实际需要的 375px 值
 */
export const px2rem = (windowWidth, designWidth = 750) => {
  var ratio = windowWidth / designWidth;
  return function(px) {
    return Number((px * ratio).toFixed(2));
  }
}
export const px = px2rem(window.innerWidth, 750)

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

/**
 * 让对象中的某值变化，配上联动函数
 */
export const watchValueChange = (obj, key, callback) => {
  const temp = {}, proxy = {};
  temp[key] = obj[key];
  // 父级值变动，触发 proxy 变动，即子级的变动
  Object.defineProperty(obj, key, {
    set(val) { proxy[key] = val; return val; },
    get() { return proxy[key]; }
  });
  // 子级的数值变动
  Object.defineProperty(proxy, key, {
    set(newValue) {
      const oldValue = temp[key];
      newValue = callback && callback(newValue, oldValue) || newValue;
      temp[key] = newValue;
    },
    get() { return temp[key] }
  });
}