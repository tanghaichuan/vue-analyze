// 初始化render函数相关
export function initProxy(vm) {
  const handlers = {
    get(target, key) {
      return target[key]
    }
  }
  vm._renderProxy = new Proxy(vm, handlers)
}