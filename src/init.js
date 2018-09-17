import {
  initProxy
} from './proxy'
import {
  initState
} from './state'
import {
  initLifecycle,
  callHook
} from './lifecycle'
import {
  mergeOptions,
  normalizeProps
} from './utils/options'

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

    // 存储watcher实例对象
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

function initProvide() {

}

function initProvide() {

}