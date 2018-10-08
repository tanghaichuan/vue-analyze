import {
  nextTick
} from '../utils/next-tick';
import {
  callHook
} from '../lifecycle'


let has = {};
// 判断是否是最后一次更新
let flushing = false;
// 队列是否加满
let waiting = false;
let index
const queue = [];

function resetSchedulerState() {
  index = queue.length = 0
  has = {}
  waiting = flushing = false
}


function flushSchedulerQueue() {
  // 此时该次watcher所在执行栈都已清空（即同步代码已执行完毕）
  flushing = true; // 微任务队列执行完后，所有的watcher肯定都已加入到queue中，且同步更新代码已经执行完毕。
  let watcher, id;

  // 对队列中的watcher进行排序
  // 排序原因：
  // 1.组件的更新顺序都是从父组件到子组件（因为父组件总是在子组件之前被实例化）
  // 2.可以先执行数据的变动，在进行渲染（保证user watchers在render watcher之前）
  // 3.如果一个组件在父组件watcher运行期间销毁，它的Watcher将被跳过
  queue.sort((a, b) => a.id - b.id);

  // 不要在运行watcher时缓存length，因为在这期间会有更多的watcher放入队列中（）
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index];
    watcher.before && watcher.before();

    id = watcher.id;
    has[id] = null;

    watcher.run();
    // 注意同一个watcher触发更新次数为100次
  }

  resetSchedulerState()
  callUpdatedHooks()
}

function callUpdatedHooks() {
  let i = queue.length
  while (i--) {
    const watcher = queue[i]
    const vm = watcher.vm
    if (vm._watcher === watcher && vm._isMounted) {
      callHook(vm, 'updated')
    }
  }
}

export function queueWatcher(watcher) {
  const id = watcher.id;
  // 所有的watcher放入队列中
  // 理论上无法判断哪次变动是同步执行代码中的最后一次变动，
  // 所以只需要将第一个变动放进微任务队列中（默认）处理即可
  if (has[id] == null) {
    // watcher不重复添加
    // 忽略同步代码中的变动，只存储第一个变动
    has[id] = true;
    if (!flushing) {
      // 先将所有的watcher放入队列中
      queue.push(watcher);
    } else {
      // 当watcher都已加入到队列，并且在微任务中处理watchers的回调函数(cb)出错或者未执行完毕
      // 进入下一次tick执行时，若上一次tick中存在未执行完或者执行出错的watcher，则优先处理该watcher
      let i = queue.length - 1
      while (i > index && queue[i].id > watcher.id) {
        i--
      }
      queue.splice(i + 1, 0, watcher)
    }

    // 判断一次tick中的watcher队列是否处理完毕
    // watcher处理完毕后开锁
    if (!waiting) {
      waiting = true;
      nextTick(flushSchedulerQueue);
    }
  }
}