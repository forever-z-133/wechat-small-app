Page({
  data: {
    prize_word: '',
  },
  onReady: function () {
    this.shake(function(count){
      var prize = wx.getStorageSync('shake_prize');
      if (count === 2) {
        this.shake_stop();
        if (!prize) {
          wx.setStorageSync('shake_prize', '摇奖礼物');
          this.setData({
            prize_word: '恭喜您中奖啦'
          });
        } else {
          this.setData({
            prize_word: '抱歉，您已中奖！'
          });
        }
        setTimeout(function () {
          wx.redirectTo({
            url: '../card/card',
          })
        }, 1000);
      }
    }.bind(this));
  },
  shake: function (fn) {
    var count = 0;
    var lastTime = new Date();
    var lastX = null, lastY = null, lastZ = null;
    wx.onAccelerometerChange(function (res) {
      var currentTime;
      var timeDifference;
      var deltaX = 0, deltaY = 0, deltaZ = 0;
      if ((lastX === null) && (lastY === null) && (lastZ === null)) {
        lastX = res.x; lastY = res.y; lastZ = res.z; return;
      }
      deltaX = Math.abs(lastX - res.x) * 100;
      deltaY = Math.abs(lastY - res.y) * 100;
      deltaZ = Math.abs(lastZ - res.z) * 100;
      if (((deltaX > 15) && (deltaY > 15)) ||
        ((deltaX > 15) && (deltaZ > 15)) ||
        ((deltaY > 15) && (deltaZ > 15))) {
        currentTime = new Date();
        timeDifference = currentTime.getTime() - lastTime.getTime();

        if (timeDifference > 500) {
          fn && fn(++count);
          lastTime = new Date();
        }
      }
      lastX = res.x; lastY = res.y; lastZ = res.z;
    })
    wx.startAccelerometer()
  },
  shake_stop: function () {
    wx.stopAccelerometer()
  },
})