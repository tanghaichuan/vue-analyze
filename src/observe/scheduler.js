let has = {}
// 判断是否是最后一次更新
let flushing = false
// 队列是否加满
let waiting = false
const queue = []

export function queueWatcher(watcher) {
  const id = watcher.id
  if (has[id] == null) {
    // 该次watcher只更新一次
    has[id] = true
    if (!flushing) {
      // 先将所有同步更新放入队列中
      queue.push(watcher)
    } else {

    }

    // 队列满之后
    if (!waiting) {
      waiting = true
      console.log(queue);
    }
  }
}