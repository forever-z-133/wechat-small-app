// 事件订阅发布模式

let instance

export default class EventBus {
  constructor() {
    if (instance) return instance;
    instance = this;

    this.handlers = {};
  }

  // 订阅事件
  on(eventType, handler) {
    if (!(eventType in this.handlers)) {
      this.handlers[eventType] = [];
    }
    this.handlers[eventType].push(handler);
    return this;
  }

  // 触发事件(发布事件)
  emit(eventType, ...args) {
    for (var i = 0; i < this.handlers[eventType].length; i++) {
      this.handlers[eventType][i].apply(this, args);
    }
    return this;
  }

  // 删除订阅事件
  off(eventType, handler) {
    var currentEvent = this.handlers[eventType];
    if (!handler) {
      this.handlers[eventType] = [];
      return this;
    }
    if (currentEvent) {
      var len = currentEvent.length;
      for (var i = len - 1; i >= 0; i--) {
        if (currentEvent[i] === handler) {
          currentEvent.splice(i, 1);
        }
      }
    }
    return this;
  }
}