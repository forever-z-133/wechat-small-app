// components/chooseEnviroment/index.js

import config from '../../utils/config.js';
const app = getApp();

if (config.isPrd) {
  wx.setStorageSync('env_now', config.enviroment.prd);
}

Component({
  options: {
    addGlobalClass: true,
  },
  data: {
    env_now: undefined
  },
  ready() {
    this.chosen(wx.getStorageSync('env_now'));
  },
  methods: {
    to_uat() {
      this.chosen(config.enviroment.uat);
    },
    to_pre() {
      this.chosen(config.enviroment.pre);
    },
    to_test() {
      this.chosen(config.enviroment.test);
    },
    chosen(env_now) {
      if (!env_now) return;
      wx.setStorageSync('env_now', env_now);
      app.data.env_now = env_now;
      this.setData({ env_now });
      this.triggerEvent('change', env_now);
    }
  }
})
