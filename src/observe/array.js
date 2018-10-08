import {
  def
} from '../utils/util'

// 重写原生数组方法

const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto) // arrayMethods.__proto__ = Array.prototype

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

methodsToPatch.forEach(method => {
  // 先缓存原始数组方法
  const original = arrayProto[method]
  // 重写array中的原生方法
  // mutator：重写的方法体
  // arrayMethods中的方法不可枚举
  def(arrayMethods, method, function mutator(...args) {
    const result = original.apply(this, args)
    const ob = this.__ob__
    // 保存新增的数组元素
    let inserted
    // push,unshift,splice
    // 等都可以为数组增加元素，而新增的元素需要重新建立dep与watcher的联系
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        // splice可是视为删除-新增
        // 获取新增的值
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted)
    // 如果调用的数组方法，则默认发生了值变更，触发dep下面所有关联的watcher变动
    ob.dep.notify()
    return result
  })
})