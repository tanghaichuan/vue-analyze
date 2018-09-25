const callbacks = []
let pending = false
let useMacroTask = false

// vue默认将回调函数放入微任务队列中，这样的弊端是回调函数执行的优先级较高（比如插入顺序执行的事件处理会有问题）。
// 根据HTML Standard,在每个宏任务执行之后，UI都会完成渲染，如果使用宏任务队列完成数据更新，则渲染就会进行两次。（UI渲染属于宏任务）
let microTimerFunc // 将watcher变动的回调函数放入微任务队列中
let macroTimerFunc // 将watcher变动的回调函数放入微任务队列中

function flushCallbacks() {
  pending = true // 解锁
  const copies = callbacks.slice(0); // 返回新的数组
  callbacks.length = 0; // ???
  copies.forEach(item => item())
}

const p = Promise.resolve()
microTimerFunc = () => {
  p.then(flushCallbacks)
}

// nextTick默认将回调函数放入微任务队列，并且多个nextTick放入队列中依次处理。
// nextTick与UI渲染时序问题？？
export function nextTick(cb, ctx) {
  callbacks.push(() => {
    cb.call(ctx)
  })

  if (!pending) {
    pending = true // 关锁
    if (useMacroTask) {
      macroTimerFunc()
    } else {
      microTimerFunc()
    }
  }
}