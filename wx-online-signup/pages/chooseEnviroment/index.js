// pages/chooseEnviroment/index.js

import config from '../../utils/config.js';

Page({
  to_uat () {
    // config.enviroment.now = config.enviroment.uat;
    wx.setStorageSync('env_now', config.enviroment.uat);
    wx.setStorageSync('env_now_name', 'uat');
    wx.navigateBack();
  },
  to_pre() {
    // config.enviroment.now = config.enviroment.pre;
    wx.setStorageSync('env_now', config.enviroment.pre);
    wx.setStorageSync('env_now_name', 'pre');
    wx.navigateBack();
  },
  to_test() {
    // config.enviroment.now = config.enviroment.pre;
    wx.setStorageSync('env_now', config.enviroment.test);
    wx.setStorageSync('env_now_name', 'test');
    wx.navigateBack();
  }
})