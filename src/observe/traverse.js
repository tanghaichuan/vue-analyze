import {
  isObject,
  _Set as Set
} from '../utils/util'

// 存放递归已访问的目标的dep.id
const seenObjects = new Set()

export function traverse(val) {
  _traverse(val, seenObjects)
  seenObjects.clear()
}

function _traverse(val, seen) {
  let i, keys
  const isA = Array.isArray(val)
  if ((!isA && !isObject(val)) || Object.isFrozen(val)) {
    // 深度监听的目标必须是数组或者对象，并且不能是冻结对象
    return
  }
  if (val.__ob__) {
    // 如果递归目标是对象，将对象的dep.id放入seen中
    // 避免出现对象循环引用
    const depId = val.__ob__.dep.id
    if (seen.has(depId)) {
      return
    }
    seen.add(depId)
  }
  // 递归对象/数组下面所有的属性/单元项
  if (isA) {
    i = val.length
    while (i--) {
      _traverse(val[i], seen)
    }
  } else {
    keys = Object.keys(val)
    i = keys.length
    // 注意这里减号跟在i后面，不然0无法进入循环
    while (i--) {
      _traverse(val[keys[i]], seen)
    }
  }
}