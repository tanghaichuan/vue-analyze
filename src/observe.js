import {
  isObject
} from './utils/util'

// 对data上挂在的属性进行数据劫持
export function observe(value = {}, asRootData = true) {
  // 对传入的对象属性进行过滤，判断哪些需要进行数据劫持
  if (!isObject(value) || !value) {
    return
  }
  if (Array.isArray(value)) {
    return
  }
  // 将object类型实例化为Observer
  return new Observer(value)
}

// 访问每个属性，将其转换为observer
// 为绑定对象的每个属性绑定getter/setter
// 收集依赖并触发更新
class Observer {
  constructor(value) {
    this.walk(value)
  }
  // 劫持属性，为当前obj下面的属性绑定getter和setter
  // 只能劫持object类型的属性
  walk(obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }
}

function defineReactive(obj = {}, key = '', val) {
  const property = Reflect.getOwnPropertyDescriptor(obj, key)
  // 预定义属性的get/set
  const getter = property && property.get
  const setter = property && property.set

  // 只在object不存在getter时才调用defineReactive
  if ((!getter || setter) && arguments.length === 2) {
    // 初始化observe时缓存初始值
    val = obj[key]

  }

  // 为object类型绑定observe
  let childObj = observe(val);

  Reflect.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      if (childObj) {

      }
      return 'test'
    },
    set() {}
  })
}