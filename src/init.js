import {
  mergeOptions,
  normalizeProps
} from './utils/options'
import {
  observe
} from './observe'


let uid = 0

export function initMixin(Mue) {
  Mue.prototype._init = function (options) {
    // 绑定执行上下文
    const vm = this
    vm._options = options
    vm._uid = 0
    vm._isVue = false
    vm._renderProxy = this

    vm._watcher = null
    // 存储事件
    vm._events = null
    // 系统事件标识位
    vm.__hasHookEvent = null
    // the root of the child tree
    vm._vnode = null

    // watcher队列
    vm._watchers = null

    // 组件唯一标识
    vm._uid = uid++
    vm._isVue = true

    // 对options进行处理，存入$options---->主要考虑 vue.mixins及vue.extend两种情况
    vm.$options = mergeOptions(resolveConstructorOptions(vm.constructor), vm._options || {})
    vm._data = vm.$options.data
    // render函数相关
    initProxy(vm)

    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    callHook(vm, 'beforeCreate')
    initInjections(vm)
    // 对data属性代理，检测data  props  computed属性值变化
    initState(vm)
    initProvide(vm)
    callHook(vm, 'created')
  }
}

function resolveConstructorOptions(Ctor) {
  return Ctor.options
}
// 调用钩子函数方法
function callHook(vm, hook = '') {
  const handlers = vm.$options[hook]
  if (handlers) {
    handlers.call(vm)
  }
}
// 初始化render函数相关
function initProxy(vm) {
  const handlers = {
    get(target, key) {
      return target[key]
    }
  }
  vm._renderProxy = new Proxy(vm, handlers)
}

function initLifecycle(vm) {
  vm._watcher = null
}
// 初始化事件对象，存储事件
function initEvents(vm) {
  vm._events = Object.create(null)
  vm.__hasHookEvent = false
}
// 初始化渲染属性
function initRender(vm) {
  // 处理组件slot，返回slot插槽对象
  // 初始化$attrs $listener，为其绑定响应式数据更新
}

function initInjections(vm) {}
// 初始化data props  computed
function initState(vm) {
  vm._watchers = []
  const opts = vm.$options
  if (opts.data) {
    initData(vm)
  }
}
// 对data中挂载的数据进行数据拦截
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
      vm[sourceKey][key] = val
    }
  })
}

function initProvide() {

}

function initProvide() {

}