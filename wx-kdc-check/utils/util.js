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

function QueryString(name, str) {
  var reg = new RegExp('(^|\\?|&)' + name + '=([^&]*)(&|$)');
  var r = decodeURIComponent(str).match(reg);
  return r != null ? decodeURIComponent(r[2]) : null;
}

function convertTime(d) {
  return new Date(parseInt(d.replace("/Date(", "").replace(")/", ""), 10));
}

function wxScan(callback) {
  wx.showLoading({
    title: '调取扫一扫',
  })
  wx.scanCode({
    success: res => {
      wx.hideLoading()
      if (!res) return;  // 非二维码会返回 null
      if (callback) {
        callback(decodeURIComponent(res.result))
      }
    },
    fail: err => {
      wx.hideLoading()
      if (!/cancel/.test(err.errMsg)) {
        wx.showModal({
          content: '该二维码无法识别',
        })
      }
    }
  })
}

module.exports = {
  formatTime,
  QueryString,
  convertTime,
  wxScan,
  convertDate: function (datestr) {
    return new Date(parseInt(datestr.replace("/Date(", "").replace(")/", ""), 10));
  },
  parseDate: function (date, pattern, needZero) {
    var str = pattern;
    str = str.replace(/y{4}/i, date.getFullYear());
    str = str.replace(/m{2}/i, (date.getMonth() + 1));
    str = str.replace(/d{2}/i, date.getDate());
    str = str.replace(/h{2}/i, date.getHours());
    str = str.replace(/n{2}/i, date.getMinutes());
    str = str.replace(/s{2}/i, date.getSeconds());
    return str;
  },
  addZero: function (num, len) {
    var len = num.toString().length || 2;
    while (len < n) { num = '0' + num; len++ }
    return num + '';
  },
}
