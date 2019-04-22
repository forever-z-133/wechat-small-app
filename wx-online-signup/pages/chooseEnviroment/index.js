// pages/chooseEnviroment/index.js

import config from '../../utils/config.js';
const app = getApp();

Page({
  to_uat () {
    wx.setStorageSync('env_now', config.enviroment.uat);
    app.event.emit('enviromentReady', config.enviroment.uat)
    wx.navigateBack();
  },
  to_pre() {
    wx.setStorageSync('env_now', config.enviroment.pre);
    app.event.emit('enviromentReady', config.enviroment.pre)
    wx.navigateBack();
  },
  to_test() {
    wx.setStorageSync('env_now', config.enviroment.test);
    app.event.emit('enviromentReady', config.enviroment.test)
    wx.navigateBack();
  }
})