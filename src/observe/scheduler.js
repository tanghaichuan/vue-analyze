import {
  nextTick
} from '../utils/next-tick'

let has = {}
// 判断是否是最后一次更新
let flushing = false
// 队列是否加满
let waiting = false
const queue = []

function flushSchedulerQueue(params) {
  console.log(this);
}

export function queueWatcher(watcher) {
  const id = watcher.id
  // 所有的watcher放入队列中
  // 理论上无法判断哪次变动是同步执行代码中的最后一次变动，
  // 所以只需要将第一个变动放进微任务队列中（默认）处理即可
  // 宏任务处理策略---->待更新
  if (has[id] == null) {
    // 该次watcher只更新一次
    has[id] = true
    if (!flushing) {
      // 先将所有同步更新放入队列中
      queue.push(watcher)
    } else {
      // console.log(watcher);
    }

    // 队列满之后
    // 只能一个一个处理watcher
    if (!waiting) {
      waiting = true

      nextTick(flushSchedulerQueue)
    }
  }
}