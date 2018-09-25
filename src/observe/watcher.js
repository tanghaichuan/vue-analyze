import {
  parsePath,
  isObject
} from '../utils/util'
import Dep, {
  pushTarget,
  popTarget
} from './dep'
import {
  queueWatcher
} from './scheduler'

// Watcher：观察者对象
// 当监测(watch)属性时，watcher会与Dep相互关联。
// watcher会将依赖属性（访问的属性）的Dep对象的id放入newDepIds中
// 对应属性实例化的Dep对象会把当次实例化的watcher对象放入Dep的subs中
// 一次watch可能会依赖多个属性->多个Dep，
// 每个Dep收集到变动后都会通知该watcher
// 不同的watcher会被推入队列中，处于同一tick中的watcher队列会被放入微任务队列中统一处理。
// watcher不会重复加入队列中

let uid = 0
export default class Wacher {
  constructor(vm, expOrFn, cb, options) {
    this.vm = vm
    vm._watchers.push(this)
    if (options) {
      this.sync = !!options.sync
      // 在调用cb之前触发的钩子函数
      this.before = options.before
    } else {
      // this.deep->对object类型深度监听
      // this.user->cb出错时进行提示
      // sync->是否监听同步更新的变动，true->同步代码每一次变动都更新 false->只记录最后一次
      this.deep = this.user = this.computed = this.sync = false
    }
    // 回调函数
    this.cb = cb
    this.id = ++uid
    // 控制watch开始结束
    this.active = true


    // 收集原始依赖数组
    this.deps = []
    // 依赖变动后收集数组
    this.newDeps = []

    this.depIds = new Set()
    this.newDepIds = new Set()

    if (typeof expOrFn === 'function') {

    } else {
      this.getter = parsePath(expOrFn)
    }

    if (this.computed) {

    } else {
      // 缓存Watcher实例化时访问的属性值(最原始值)
      this.value = this.get()
    }
  }
  get() {
    // Dep.target指向当前Watcher对象，并收集watch监测的属性值
    pushTarget(this)
    let value
    let vm = this.vm
    value = this.getter.call(vm, vm)
    popTarget()
    // this.cleanupDeps()
    return value
  }
  addDep(dep) {
    // 如'a.b.c'会将路径上的每个属性的Dep对象id放入newDepIds中
    // 或者同一次watcher访问了多个data上挂在的属性
    const id = dep.id
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id)
      this.newDeps.push(dep)
      if (!this.depIds.has(id)) {
        dep.addSub(this)
      }
    }
  }
  update() {
    // 在Vue的响应式策略中，同步只记录最后一次变动  sync->false
    // 异步会将变动放进队列中依次更新（异步中的同步同上）
    // 接受Dep下发的变动信息
    // 只有在数据发生变动时才出发该钩子函数
    if (this.sync) {
      // 是否为同步更新
      this.run()
    } else {
      // 默认是异步更新，及将不同的watcher放入队列中，队列中的每个watcher的变更回调函数都放在微任务队列中（只执行一次）
      queueWatcher(this)
    }
  }
  run() {
    if (this.active) {
      this.getAndInvoke(this.cb)
    }
  }
  // 获取新值及旧值，调用回调函数
  getAndInvoke(cb) {
    const value = this.get()
    if (value !== this.value || isObject(value) || this.deep) {
      const oldValue = this.value; // 拿到原始值
      this.value = value // 更新原始值
      this.dirty = false
      cb.call(this.vm, value, oldValue)
    }
  }
}