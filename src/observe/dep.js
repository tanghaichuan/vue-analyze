// 发布/订阅管理器
// 维护订阅发布的动作
// 给watcher收集原始值
// 变动发生时通知watcher
// 维护watcher与dep之间的通信关系

let uid = 0

export default class Dep {
  constructor() {
    // 单个watcher中需要观察的事件数量
    this.id = uid++
    // 事件队列
    this.subs = []
  }
  addSub(sub) {
    // 将需要关联的watcher放进队列
    this.subs.push(sub)
  }
  depend() {
    if (Dep.target) {
      // 访问属性值时，通知Watcher收集依赖(原始值)
      Dep.target.addDep(this)
      console.log(this);
    }
  }
  notify() {
    // 变动发生时，通知watcher触发更新操作
    const subs = this.subs.slice()
    console.log(subs);
  }
}

// 当前订阅watcher
// 一个时刻只能处理一个watcher对象
Dep.target = null
// 管理watcher栈
const targetStack = []

export function pushTarget(_target) {
  // 当进行数据拦截触发getter时开始订阅，
  // 将target指向当前watcher
  // 多个watcher放进栈里，依次处理
  if (Dep.target) {
    targetStack.push(Dep.target)
  }
  Dep.target = _target
}

export function popTarget() {
  // 出栈
  // 取出栈顶的watcher
  Dep.target = targetStack.pop()
}