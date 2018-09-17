// Watcher：观察者对象
// 依赖收集之后的Watcher实例会被保存至Dep中subs栈中
// 数据变动后，Dep通知Watcher实例调用回调函数（cb）

export default class Wacher {
  constructor(vm, expOrFn, cb, options) {
    this.vm = vm
    vm._watchers.push(this)
    if (options) {

    } else {
      console.log(this);
    }
  }
}