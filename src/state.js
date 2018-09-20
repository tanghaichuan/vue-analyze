// 状态相关
// state初始化时会递归data中挂载的每个属性
// 将data代理为this->实例化的vue对象->代理实际上是将data上属性写入this中
// 完成代理后初始化observe
// 混入$watch方法

import {
  observe
} from './observe/observe'
import Watcher from './observe/watcher'
import {
  isObject
} from './utils/util'


// 初始化data props  computed
export function initState(vm) {
  vm._watchers = []
  const opts = vm.$options
  if (opts.data) {
    initData(vm)
  }
}

// 对data中挂载的数据进行数据拦截
// 将data.key代理为this.key
function initData(vm) {
  let data = vm.$options.data
  const keys = Object.keys(data)
  let i = keys.length
  while (i--) {
    // 将data.key代理为this.key
    proxy(vm, `_data`, keys[i])
  }
  // 观测data中挂载属性的变化
  observe(data, true)
}

function proxy(target = {}, sourceKey = '', key = '') {
  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    get() {
      return this[sourceKey][key]
    },
    set(val) {
      this[sourceKey][key] = val
    }
  })
}

export function stateMixin(Mue) {

  // 定向监听属性值（数据）变化
  // expOrFn：表达式或者函数，返回监听的属性
  // cb：回调函数
  // options：$watch配置参数
  Mue.prototype.$watch = function (expOrFn, cb, options) {
    const vm = this
    if (isObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options)
    }
    const watcher = new Watcher(vm, expOrFn, cb, options)
  }
}

function createWatcher(vm, expOrFn, handler, options) {

}