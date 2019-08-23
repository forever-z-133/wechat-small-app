
import config from './config.js';

var app = {};
app.data = {};

function alert(text, fn) {
  wx.hideLoading();
  wx.stopPullDownRefresh();
  wx.hideToast();
  wx.showModal({ content: text, mask: true, showCancel: false, success: fn });
}

function getQueryString(name, str) {
  var str = decodeURIComponent(str);
  var reg = new RegExp('(^|\\?|&)' + name + '=([^&]*)(&|$|\'|\")');
  var r = (str || '').match(reg);
  if (r != null) return decodeURIComponent(r[2]); return null;
}

function is(reg) {
  return function(val) {
    return reg.test(val)
  }
}

var isTel = is(/^1\d{10}$/);

function commonCallBack(res, name) {}

/*
* 获取 code
*/
function getCode(callback) {
  wx.login({
    complete: res => {
      if (!/ok$/i.test(res.errMsg)) return alert('登录失败！');
      if (!res.code) return alert('未取得 code！');
      console.log('登录', res.code);
      callback && callback(res.code, res);
    },
  });
}

/*
* 获取 userInfo
* 是否带私密信息
*/
function getUserInfo(code, callback, options) {
  var opts = {
    lang: 'zh_CN',
  };

  // 不传 code 则为拿取用户信息，传 code 则再加上私密信息
  if (typeof code === 'function') {
    callback = code; code = null;
    if (app.data.userInfo) {
      return callback && callback(app.data);
    }
  } else if (typeof code === 'string') {
    opts.withCredentials = true;
  } else return alert('util.getUserInfo 传参有误')

  // 设置回调
  opts.complete = res => {
    if (!/ok$/i.test(res.errMsg)) return alert('获取用户信息失败！');
    // console.log('用户信息', res.userInfo);
    app.data.userInfo = res.userInfo;
    callback && callback(res)
  }

  // 新加的 options 覆盖默认值
  opts = Object.assign({}, opts, options);

  // 进行授权弹窗
  wx.getUserInfo(opts)
}

/*
* 本页 url 是否正是 path
*/
function isPage(path = 'pages/index/index') {
  var url = getCurrentPages();
  var nowUrl = url.length > 1 ? url.slice(-1)[0] : {};
  var nowPath = nowUrl.route || '';
  nowPath = nowPath.replace(/(\?|#)[\w\W]*$/, '');
  return nowPath === path;
}

/*
* 内存装饰器
*/
function useCache(fn) {
  var cache = {};
  return function () {
    var key = arguments.length + Array.prototype.join.call(arguments, ",");
    if (key in cache) return cache[key];
    else return cache[key] = fn.apply(this, arguments);
  }
}

/*
 * 从 onLoad 中的 options 中取得 key 相应的值
 */
function getValueFromUrl(key, opts) {
  if (!opts || JSON.stringify(opts) == '{}') return '';
  if (opts[key] == '') return '';
  if (opts[key]) return opts[key];
  if (opts.query && opts.query[key]) return opts.query[key];
  var path = opts.query ? opts.query.q : opts.q || '';
  return getQueryString(key, path);
}

// 从转发链接中获取所需信息
function getShareParams(url) {
  return {
    rawUrl: url,
    href: url.replace(/iid=[^$]*/, '').replace(/sid=[^&#$]*&?/, '').replace(/(\?|&|#)*$/, ''),
    campusId: getQueryString('cid', url),
    referrerId: getQueryString('sid', url) || getQueryString('wid', url),
    referrerName: getQueryString('sn', url),
    institutionId: getQueryString('iid', url),
    userId: getQueryString('wid', url),
    token: getQueryString('token', url),
  }
}

// 拿取 config 里的链接时，先选择环境
function chooseEnviromentFirst(key) {
  var env = wx.getStorageSync('env_now') || null;
  if (!env) return null;
  return key ? env[key] : env;
}

function InterceptManage() {
  var temp = {};
  return {
    data: temp,
    set: function (key, times) {
      temp[key] = times;
      return temp[key];
    },
    get: function (key) {
      return temp[key] || 0;
    },
    ok: function (key) {
      if (--temp[key] < 1) return true;
      else return false;
    },
    remove: function (key) {
      delete temp[key];
    }
  }
}

// 往 url 中添加新值
function urlAddSearch(url, search) {
  if (!search) return url;
  let join = '?';
  if (url.indexOf('?') > -1) join = '&';
  return url + join + search;
}


/***
 * 去抖，不断触发 fn，但只有停止后 delta 时间才真正运行
 * @param fn
 * @param delta 单位毫秒
 * @param context this 指向
 */
function debounce(fn, delta, context) {
  var timeoutID = null;
  return function () {
    clearTimeout(timeoutID);
    var args = arguments;
    return timeoutID = setTimeout(function () {
      fn.apply(context, args);
    }, delta);
    return timeoutID;
  };
}

/***
 * 节流，不断触发 fn，但每 delta 时间间隔才运行一次
 * @param fn
 * @param delta 单位毫秒
 * @param context this 指向
 */
function throttle(fn, delta, context) {
  var timeoutID, lastDate = 0;
  return function () {
    var args = arguments;
    var nowDate = +new Date();
    if (nowDate - lastDate >= delta) {
      lastDate = nowDate;
      fn.apply(context, args);
    }
    clearTimeout(timeoutID);
    timeoutID = setTimeout(function () {
      fn.apply(context, args);
    }, delta);
    return timeoutID;
  };
}

/***
 * 如果是空对象，则返回 null
 */
function returnNoEmptyObject(obj) {
  if (!obj) return null;
  if (Object.keys) {
    return Object.keys(obj).length ? obj : null;
  } else {
    for (var i in obj) {
      if (!obj.hasOwnProperty(i)) continue;
      return obj;
    }
  }
  return null;
}

/**
 * 将对象转为带 = 的字符串
 * 比如 { a:1, b:2 } 转为 a=1&b=2
 */
function objectToString(obj, concat = '&') {
  var result = [];
  for (var key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    var value = obj[key];
    if (value == undefined) value = '';
    result.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
  }
  result = result.join(concat);
  return result;
}

module.exports = {
  alert,
  getQueryString,
  getValueFromUrl,
  getCode,
  getUserInfo,
  isPage,
  isTel,
  getShareParams,
  chooseEnviromentFirst,
  interceptManage: new InterceptManage(),
  urlAddSearch,
  debounce, throttle,
  returnNoEmptyObject,
  objectToString
}
