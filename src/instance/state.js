// 状态相关
// state初始化时会递归data中挂载的每个属性
// 将data代理为this->实例化的vue对象->代理实际上是将data上属性写入this中
// 完成代理后初始化observe
// 混入$watch方法

import {
  observe,
  set,
  del
} from '../observe/observe'
import Watcher from '../observe/watcher'
import {
  isObject
} from '../utils/util'

const noop = _ => {}

// 定义的访问器属性
const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

// 初始化data props  computed
export function initState(vm) {
  vm._watchers = []
  const opts = vm.$options
  if (opts.data) {
    initData(vm)
  }
  // 初始化计算属性
  if (opts.computed) {
    initComputed(vm, opts.computed)
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

const computedWatcherOptions = {
  computed: true
}

// 使用$watch监听计算属性->实例化Watcher->访问计算属性->触发计算属性getter->实例化计算属性的computedWatcher
// -> 挂载在vm上的计算属性与computedWatcher建立关联 -> 求值，将值缓存在computedWatcher中
// -> 求值过程中会访问计算属性依赖的属性 -> 触发依赖属性的getter->建立与watcher和computedWatcher的关联
// -> 依赖属性发生改变时->调用dep.notify通知[watcher和computedWatcher]发生变动了
// -> computedWatcher由于deps不为空->将dirty=false->重新对计算属性求值并缓存。
function initComputed(vm, computed) {
  const watchers = vm._computedWatchers = Object.create(null)
  for (const key in computed) {
    const userDef = computed[key]
    const getter = typeof userDef === 'function' ? userDef : userDef.get
    // 为当前计算属性创建一个watcher观察者对象
    // 访问当前计算属性时，触发自定义getter/setter
    // 计算属性的求值相当于惰性求值
    watchers[key] = new Watcher(vm, getter, noop, computedWatcherOptions)

    if (!(key in vm)) {
      // 计算属性需要挂载在vue实例对象上
      defineComputed(vm, key, userDef)
    } else {
      if (key in vm.$data) {
        console.error(`The computed property "${key}" is already defined in data.`, vm)
      }
    }
  }
}
export function defineComputed(target, key, userDef) {
  // 默认缓存计算属性值
  // 所谓的缓存即：下次访问该计算属性拿到的值是存储在Watcher中的value，而不会在调用一次计算属性求值
  // 前提是依赖的属性未发生变化
  // 依赖的属性发生变化后会更新value值并发出变动。
  const shouldCache = true;
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = shouldCache ? createComputedGetter(key) : userDef
    sharedPropertyDefinition.set = noop
  } else {

  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

// 计算属性初始化时会实例化一个watcher对象（由于设置了compted:true，所以不会调用get()求值），并给key绑定getter函数
// 计算属性只有在访问的时候才会求值
// 如果使用watch观测计算属性的变化，表明其依赖的所有属性发生变化都会触发计算属性的watcher变化
// 关于监听计算属性变化：只有依赖的属性发生了变化后，才会对计算属性进行求值。
function createComputedGetter(key) {
  return function computedGetter() {
    const watcher = this._computedWatchers && this._computedWatchers[key]
    if (watcher) {
      // 访问计算属性->访问计算属性get->访问计算属性依赖的变量->触发计算属性依赖变量的get->建立watcher和dep的关联->求值并缓存
      watcher.depend()
      return watcher.evaluate()
    }
  }
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

  // 混入set/$set方法
  Mue.prototype.$set = set
  // 混入del/$del方法
  Mue.prototype.$delete = del
}

function createWatcher(vm, expOrFn, handler, options) {

}