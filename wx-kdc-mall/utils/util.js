const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


// 判断类型
function TypeOf(obj) {
  return Object.prototype.toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
}

// 合并多个对象，深拷贝，带 deep 则合并内层对象。
// 比如 a:{x:1} 和 a:{y:1}，带 deep 会合并成 a:{x:1,y:1}，不带则覆盖成 a:{y:1}
function _merge(deep, target, ...objs) {
  if (typeof deep != 'boolean') {
    objs = [target].concat(objs);
    target = deep;
    deep = false;
  }
  var result = Object.assign({}, target);
  return objs.reduce((re, obj) => {
    for (let i in obj) {
      if (i in result && TypeOf(obj[i]) == 'object' && deep) {
        result[i] = _merge(result[i], obj[i])
      } else {
        result[i] = obj[i];
      }
    }
    return result;
  }, target)
}

function systemError(r) {
  if (typeof r == 'string') {
    wx.showModal({
      content: '系统出错了',
      showCancel: '好吧',
    });
    return true;
  } else return false;
}

function money(...nums) {
  nums = nums.reduce((a,b) => a+b, 0);
  return '￥' + nums.toFixed(2)
}

module.exports = {
  formatTime,
  extend: _merge,
  systemError,
  money,
}
