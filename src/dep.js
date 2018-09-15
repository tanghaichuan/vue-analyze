// 发布/订阅管理器
export default class Dep {
  constructor() {

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