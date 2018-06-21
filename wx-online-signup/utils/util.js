
var app = {};
app.data = {};

function alert(text, fn) {
  wx.showModal({ content: text, mask: true, showCancel: false, success: fn });
}

function getQueryString(name, str) {
  var str = decodeURIComponent(str);
  var reg = new RegExp('(^|\\?|&)' + name + '=([^&]*)(&|$|\'|\")');
  var r = (str || window.location.href).match(reg);
  if (r != null) return decodeURIComponent(r[2]); return null;
}

function is(reg) {
  return function(val) {
    return reg.test(val)
  }
}

var isTel = is(/1\d{10}/);

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
* 检测是否全部已授权
* arr 可为 ['info', 'camera'] 或 'camera' 两种形式
*/
function _checkAuth(arr, callback) {
  wx.getSetting ? wx.getSetting({
    success: settings => {
      var auth = settings.authSetting;

      // 一些容错判断
      if (typeof arr === 'string') arr = [arr];
      if (!Array.isArray(arr)) return alert('checkAuth 传参有误');
      if (arr.length < 1) return callback && callback(false, auth);

      // 是否获得了所有授权
      var hasAllAuth = arr.every((one) => {
        return auth['scope.' + one]
      })
      // console.log('需授权', arr.join(','), '已授权', settings.authSetting, '是否全授权', hasAllAuth);

      callback && callback(hasAllAuth, auth)
    }
  }) : alert('您的小程序版本太低，请更新微信');
}

/*
* 是否获取了所有授权，主要逻辑在 _checkAuth 中
* str 为 'info,camera' 的必填形式
*/
function hasGotAllAuth(str, callback) {
  if (typeof str != 'string') return alert('hasGotAllAuth 传参有误！');
  var arr = (str || 'userInfo').split(',');
  _checkAuth(arr, (yes, raw) => {
    callback && callback(yes, raw);
  });
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
  if (opts[key] == '' || opts[key] == undefined) return '';
  if (opts[key]) return opts[key];
  if (opts.query && opts.query[key]) return opts.query[key];
  var path = opts.query ? opts.query.q : opts.q || '';
  return getQueryString(key, path);
}

module.exports = {
  alert,
  getQueryString,
  getValueFromUrl,
  getCode,
  getUserInfo,
  hasGotAllAuth,
  isPage,
  isTel,
}
