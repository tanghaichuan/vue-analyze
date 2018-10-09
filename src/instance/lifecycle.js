// 生命周期相关

import {
  pushTarget,
  popTarget
} from '../observe/dep'
import {
  createEmptyVNode
} from '../vdom/vnode'


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

export function mountComponent(vm, el) {
  vm.$el = el

  // 优先使用render构建模板
  if (!vm.$options.render) {
    // render不存在则赋值一个渲染空vnode对象的函数
    vm.$options.render = createEmptyVNode
    let template = vm.$options.template
  }

  callHook(vm, 'beforeMount')

  let updateComponent
  // 注：开发环境下vue会对一些性能统计，但updateComponent实现的结果不变
}