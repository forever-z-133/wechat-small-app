// pages/user/user.js
const app = getApp();

Page({
  data: {
  },
  onLoad: function() {
    app.getInfo(res => {
      this.setData({ user: res })
    });
  },
})