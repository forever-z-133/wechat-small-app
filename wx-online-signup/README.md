# 在线选课 - 小程序端

----

### IDE

开发需使用 **微信开发工具**
https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

### 项目初始化

* 添加开发者和体验者权限，找歆阁

* 下载代码
```
// 小程序端代码
git clone http://vcs.xuebangsoft.net/app/class-sale-in-miniProgram.git

// 网页端代码
http://vcs.xuebangsoft.net/platform/xb-app-smallprogram-frontend.git

// 后端代码在 eduboss-platform
```

* 打开微信开发工具，新建小程序项目

* 新建小程序项目需要 appid  
小陈旭test：wx19c0639dc6e8fe0b（废弃）  
选课报名工具：wx2b7ba9c5dc71c1b5  
线上选课（正式版）：wx4df776663c197ef4  

* appid 不同需开多个 IDE

### 其他准备工作

主要是微信后台配置工作，可找歆阁或永恒

* 添加合法域名（即接口地址）
* 添加业务域名（即 web-view 地址）
* 添加二维码规则（即生成普通二维码所需地址）
* 获取 UnionId 需绑定开放平台（找逸清）
* 基础库最低版本设置（避免不必要的兼容）
* 后端修改 boss 配置

### 小程序文档
开发文档：https://developers.weixin.qq.com/miniprogram/dev/  
官方论坛：https://developers.weixin.qq.com/  