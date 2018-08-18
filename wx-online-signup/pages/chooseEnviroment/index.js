// pages/chooseEnviroment/index.js

import config from '../../utils/config.js';

Page({
  to_uat () {
    config.enviroment.now = config.enviroment.uat;
    wx.navigateBack();
  },
  to_pre() {
    config.enviroment.now = config.enviroment.pre;
    wx.navigateBack();
  }
})