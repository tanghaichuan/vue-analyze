// 生命周期相关

import {
  pushTarget,
  popTarget
} from './observe/dep'
// 调用钩子函数方法
export function callHook(vm, hook = '') {
  // pushTarget()
  const handlers = vm.$options[hook]
  if (handlers) {
    handlers.call(vm)
  }
  // popTarget()
}

export function initLifecycle(vm) {
  vm._watcher = null
}

export function lifecycleMixin() {

}