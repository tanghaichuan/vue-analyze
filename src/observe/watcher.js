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
import {
  traverse
} from './traverse'


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
  // vm 当前实例对象
  // expOrFn 观察的目标，可能是字符串或者函数。需要触发属性的get函数才能收集依赖
  // cb 观察目标变动时触发的回调函数
  // options 传递给观察者的对象 用途：？？？
  // isRenderWatcher 当前观察目标是否是渲染函数
  constructor(vm, expOrFn, cb, options, isRenderWatcher) {
    this.vm = vm
    if (isRenderWatcher) {
      vm._watcher = this
    }

    vm._watchers.push(this)
    if (options) {
      this.sync = !!options.sync
      this.deep = !!options.deep
      this.computed = !!options.computed
      // 在调用cb之前触发的钩子函数（主要用于观测组件update过程）
      this.before = options.before
    } else {
      // this.deep->对object类型深度监听
      // this.user->当前观察者实例对象是开发者定义的还是内部定义的。除了渲染函数的观察者、计算属性的观察者和对属性直接观察的观察者之外，都认为是开发者自定义的。
      // sync->是否监听同步更新的变动，true->同步代码每一次变动都更新 false->只记录最后一次
      // computed 当前观察者对象是否是计算属性的观察者
      this.deep = this.user = this.computed = this.sync = false
    }
    // 回调函数
    this.cb = cb
    this.id = ++uid
    // 控制watch开始结束
    this.active = true

    // 表示当前计算属性是否需要被求值
    // this.dirty = true 表示当前观察者没有求值
    this.dirty = this.computed
    // 收集原始依赖数组
    this.deps = []
    // 依赖变动后收集数组
    this.newDeps = []

    this.depIds = new Set()
    this.newDepIds = new Set()

    if (typeof expOrFn === 'function') {
      // 函数类型的依赖，如挂载在watch属性下面的函数，计算属性等都是惰性求值
      this.getter = expOrFn
    } else {
      // 对象类型、数组类型只能获取引用，无法缓存变动之前的旧值。
      this.getter = parsePath(expOrFn)
    }

    if (this.computed) {
      this.value = undefined
      this.dep = new Dep()
      // computed下面挂载的计算属性没有调用this.get--->计算属性走惰性求值，需要显示调用求值
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
    if (this.deep) {
      // 深度观测对象时 如：$watcher(obj)  obj.a = 1
      // 因为没有将对象下面的所有属性建立dep与watcer的关联
      // 所以属性的变更无法触发更新
      // 解决办法：主动的递归读取对象下面的所有属性值，访问时会触发getter函数->将当前观测的watcher对象放入deps中
      traverse(value)
      // console.log('traverse', value.e.f);
    }
    popTarget()
    this.cleanupDeps()
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
    // 在Vue的响应式策略中，同步只记录第一次变动  sync->false
    // 异步会将变动放进队列中依次更新（异步中的同步同上）
    // 接受Dep下发的变动信息
    // 只有在数据发生变动时才触发该钩子函数
    if (this.computed) {
      // 计算属性要求惰性求值，只有在依赖的属性发生变化后才求值
      if (this.dep.subs.length === 0) {
        // subs为零表示没有另外调用$watch监听计算属性变化
        // 访问时直接求值
        this.dirty = true
      } else {
        // 如果调用$watch监听计算属性变化，需要调用挂载的计算属性更新值(立即更新)，并调用另外声明的$watch绑定的回调函数(异步更新)
        this.getAndInvoke(() => {
          this.dep.notify()
        })
      }
    } else if (this.sync) {
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
  cleanupDeps() {

  }
  depend() {
    if (this.dep && Dep.target) {
      // 表明此时使用watch监听计算属性的变化
      // 调用dep收集依赖watcher
      this.dep.depend()
    }
  }
  evaluate() {
    if (this.dirty) {
      // 计算属性依赖的属性未变更时只求一次计算属性的值。
      this.value = this.get()
      this.dirty = false
    }
    return this.value
  }
}