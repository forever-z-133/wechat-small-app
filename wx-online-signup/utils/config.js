
const config = {
  isPrd: null,  // 是则 true，否则 null
  enviroment: {
    test: {
      name: 'test',
      appId: 'wx19c0639dc6e8fe0b',
      // webUrl: 'http://192.168.2.144:3000',
      webUrl: 'https://static-uat.xuebangsoft.net',
      // apiUrl: 'https://uat3.xuebangsoft.net/eduboss/wxapp/',
      apiUrl: 'http://192.168.2.144:8080/eduboss/wxapp/',
      apiUrl2: 'https://uat3.xuebangsoft.net/eduboss/',
    },
    uat: {
      name: 'uat',
      appId: 'wx19c0639dc6e8fe0b',
      webUrl: 'https://static-uat.xuebangsoft.net',
      apiUrl: 'https://uat3.xuebangsoft.net/eduboss/wxapp/',
      apiUrl2: 'https://uat3.xuebangsoft.net/eduboss/',
    },
    pre: {
      name: 'pre',
      appId: 'wx19c0639dc6e8fe0b',
      webUrl: 'https://static-pre.xuebangsoft.net',
      apiUrl: 'https://pre3.xuebangsoft.net/eduboss/wxapp/',
      apiUrl2: 'https://pre3.xuebangsoft.net/eduboss/',
    },
    prd: {
      name: 'prd',
      appId: 'wx4df776663c197ef4',
      webUrl: 'https://static-prd.xuebangsoft.net',
      apiUrl: 'https://www.xuebangsoft.net/eduboss/wxapp/',
      apiUrl2: 'https://www.xuebangsoft.net/eduboss/',
    },
    now: null,
  }
}

module.exports = {
  ...config
};