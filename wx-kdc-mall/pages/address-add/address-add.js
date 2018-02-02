// pages/address-add/address-add.js
var app = getApp();
import post from '../ajax.js';

var userId = null;
var user = null;
var addressId = null;

Page({
  data: {
    region: [],
    male: 0,
    type: -1,
  },
  onLoad: function (options) {
    var id = options.id;
    if (id) {  // 修改模式
      this.type = 'edit';
      addressId = id;
      var list = wx.getStorageSync('address');
      var r = list.filter(x => x.Id == id)[0];
      console.log('修改地址初始数据', r)
      this.setData({
        name: r.ContactorName,
        tel: r.ContactorPhone,
        male: r.Gender,
        more: r.Address,
        type: r.AddsType,
        region: r.AutoAddress ? r.AutoAddress.split(',') : r.WxAddress.split(','),
      })
    } else {
      this.type = 'add';
      addressId = 0;
    }
    console.log(id)

    app.entry_finish(res => {
      userId = res.userId;
      user = res.user;
    })
  },
  comfirm: function (e) {  // 添加或修改地址
    var r = e.detail.value;
    var data = {
      Id: addressId || 0,
      UserId: user,
      ContactorName: r.name,
      Gender: parseInt(r.male),
      ContactorPhone: r.tel,
      WxAddress: r.region.join(','),
      Address: r.more,
      AddsType: parseInt(r.type),
    }
    if (this.type == 'edit') {
      post.edit_address(userId, data, res => {
        // if (!r.State) return;
        wx.showToast({
          title: '修改成功',
        });
        wx.navigateBack()
      });
    } else {
      post.add_address(userId, data, res => {
        // if (!r.State) return;
        wx.showToast({
          title: '增加成功',
        });
        wx.navigateBack()
      });
    }
  },
  maleChange: function (e) {
    this.setData({ male: e.detail.value })
  },
  typeChange: function(e) {
    this.setData({ type: e.detail.value })
  },
  province: function (e) {
    this.setData({ region: e.detail.value });
  }
})