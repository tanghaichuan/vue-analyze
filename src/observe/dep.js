// 发布/订阅管理器
// 维护订阅发布的动作
// 初始化observe时：实例化dep，方便对象和数组类型特殊处理。
// 监测元素变动时（使用Watch）：将dep与watcher互相关联。
// dep负责在元素变动时通知dep关联的所有watcher触发变动。
// 即：监测的数据变动后，Dep对subs中的每个Watcher下发变动->通知Watcher实例调用回调函数（cb）

let uid = 0

export default class Dep {
  constructor() {
    // 单个watcher中需要观察的事件数量
    this.id = uid++
    // 事件队列
    this.subs = []
  }
  addSub(sub) {
    // 将需要关联的watcher放进subs中->同一个属性可能有多个watcher
    this.subs.push(sub)
  }
  depend() {
    if (Dep.target) {
      // 访问属性值时，通知Watcher收集依赖(对应的Dep对象)
      Dep.target.addDep(this)
    }
  }
  notify() {
    // 变动发生时，通知watcher触发更新操作
    const subs = this.subs.slice(); // 返回新数组
    // 变动发生时，遍历subs中存储的Watcher对象，并将变动下发。
    subs.forEach(watcher => {
      watcher.update()
    })
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