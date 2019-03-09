import './js/libs/weapp-adapter'
import './js/libs/symbol'

import Main from './js/test'

window.test = function(length, ...args) {
  if (!this.xxx || this.xxx < length) {
    console.log(...args);
    this.xxx = ++this.xxx || 1;
  }
}

// wx.loadFont('http://uat3.xuebangsoft.net/eduboss/wxApp/zyh-test/%E7%AB%99%E9%85%B7%E5%BF%AB%E4%B9%90%E4%BD%932016%E4%BF%AE%E8%AE%A2%E7%89%88.ttf');

new Main()