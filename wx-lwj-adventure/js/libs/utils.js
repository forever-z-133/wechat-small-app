
let globalCtx = null;

export const setGlobalCtx = (ctx) => {
  globalCtx = ctx;
}

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
export const anim = function(start = 0, to = 0, duration = 0, callback) {
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
export const boxGrowUp = (obj, ...padding) => {
  let top, right, bottom, left;
  if (padding.length === 0) [top = 0, right = 0, bottom = 0, left = 0] = padding;
  if (padding.length === 1) [top = 0, right = top, bottom = top, left = top] = padding;
  if (padding.length === 2) [top = 0, right, bottom = top, left = right] = padding;
  if (padding.length === 3) [top = 0, right, bottom, left = right] = padding;
  if (padding.length === 4) [top = 0, right, bottom, left] = padding;

  let { x, y, width, height } = obj;
  x -= left; y -= top; width += left + right; height += top + bottom;
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
 * 因为汉字总是得到 10px，所以按比例给出符合字体大小的宽度
 */
export const getTextWidth = (text = '', fontSize = 16) => {
  if (!text) return 0;

  return globalCtx ? globalCtx.measureText(text).width / 10 * fontSize : 0;
}

/**
 * 让对象中的某值变化，配上联动函数
 */
export const watchValueChange = (obj, key, callback, defaultValue) => {
  const temp = {}, proxy = {};
  temp[key] = obj[key] || defaultValue;
  // 父级值变动，触发 proxy 变动，即子级的变动
  Object.defineProperty(obj, key, {
    set(val) { proxy[key] = val; },
    get() { return proxy[key]; }
  });
  // 子级的数值变动，本身也要改变则 callback 中要 return 一下，切记不可直接 callback 中修改本身
  Object.defineProperty(proxy, key, {
    set(newValue) {
      const oldValue = temp[key];
      temp[key] = newValue;
      callback && callback(newValue, oldValue);
    },
    get() { return temp[key] }
  });
}

/**
 * 判断是否为透明色，在剪切效果时有用
 */
export const isTransparent = (color) => {
  if (globalCtx && globalCtx.opacity <= 0) return true;
  return /(rgba|hsla)\(([^,]*,){3}\s*0\s*\)/.test(color);
}

/**
 * border background 等属性的拆分
 */
export const border2json = (borderStr) => {
  const temp = borderStr ? borderStr.split(' ') : [];
  const [width = 0, style = 'solid', color = 'rgba(0, 0, 0, 0)'] = temp;
  return { width, style, color };
}
export const background2json = (backgroundStr) => {
  const temp = backgroundStr.split('/'); // 如果有 bg-size 先拆这个
  const temp1 = temp[0].split(' ');    // emmm 比想象中难搞，自闭了
  return { color, image, position, size, repeat };
}

/**
 * 转金钱格式 1,234,000.00 那种
 */
export const money = (val = 0, unit = ',', fixed = 2) => {
  return (Number(val) || 0).toFixed(fixed).replace(/\B(?=(\d{3})+(?!\d))/g, unit);
}