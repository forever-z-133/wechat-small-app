// component/datetime/index.js
Component({
  properties: {

  },
  data: {
    date: [],
    head: '',
    today: '',
  },
  attached: function() {
    var _now = new Date();
    var dateArr = createTheDateArr(_now);
    this.setData({
      head: date2str(_now, 'yyyy年mm月', true),
      today: date2str(_now, 'yyyy-mm-dd'),
      date: dateArr,
    });
  },
  methods: {

  }
})


// 创建日历数组
function createTheDateArr(date) {
  var result = [];
  var _fisrt = first_day_this_month(date);
  var _next_month = month_offset(_fisrt, 1);
  var _fisrt_sunday = sunday_last_week(_fisrt);
  var _last_sunday = sunday_last_week(_next_month);
  _last_sunday = day_offset(_last_sunday, 7);
  var days = two_date_minus_for_day(_fisrt_sunday, _last_sunday);
  for (var i = 0; i < days; i++) {
    var _day = day_offset(_fisrt_sunday, i);
    result.push({
      year: year(_day),
      month: month(_day),
      day: day(_day),
      str: date2str(_day, 'yyyy-mm-dd'),
      str2: date2str(_day, 'yyyy-mm'),
    })
  }
  return result;
}

//////////////////////// 一堆关于时间的公用方法 /////////////
// 获取年份
function year(date) { return date.getFullYear(); }
// 获取月份
function month(date) { return date.getMonth() + 1; }
// 获取日期
function day(date) { return date.getDate(); }
// 日期变化
function day_offset(date, num) {
  var date = new Date(date);
  return new Date(date.setDate(date.getDate() + num));
}
// 月份变化
function month_offset(date, num) {
  var date = new Date(date);
  return new Date(date.setMonth(date.getMonth() + num));
}
// 本月第一天
function first_day_this_month(date) {
  var date = new Date(date);
  return new Date(date.setDate(1));
}
// 本周第一个周一
function monday_this_week(date) {
  var date = new Date(date);
  return day_offset(date, 1 - date.getDay());
}
// 上个星期日
function sunday_last_week(date) {
  var date = new Date(date);
  return day_offset(date, 0 - date.getDay());
}
// 两个时间相隔的天数（不足一天算一天，想不算就把 floor 改为 ceil）
function two_date_minus_for_day(date1, date2) {
  return Math.abs(Math.floor((date2 - date1) / (24 * 60 * 60 * 1000)));
}
// 本月有几天，注意：month 从 1 开始
function how_much_days_this_month(date, month) {
  var date = new Date(date);
  var year = date.getFullYear();
  var m = [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  m[1] = (year % 4 == 0 && year % 100 != 0 || year % 400 == 0) ? 29 : 28;
  return m[month - 1];
}
// 日期转字符串
function date2str(date, pattern = 'yyyy-mm-dd', zero = false) {
  var str = pattern;
  str = str.replace(/y{4}/i, zero ? addZero(date.getFullYear()) : date.getFullYear());
  str = str.replace(/m{2}/i, zero ? addZero((date.getMonth() + 1)) : (date.getMonth() + 1));
  str = str.replace(/d{2}/i, zero ? addZero(date.getDate()) : date.getDate());
  str = str.replace(/h{2}/i, zero ? addZero(date.getHours()) : date.getHours());
  str = str.replace(/n{2}/i, zero ? addZero(date.getMinutes()) : date.getMinutes());
  str = str.replace(/s{2}/i, zero ? addZero(date.getSeconds()) : date.getSeconds());
  return str;
}
// 主动补零
function addZero(num, n = 2) {
  var len = num.toString().length;
  while (len++ < n) num = "0" + num;
  return num;
}