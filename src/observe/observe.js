// 对data上挂载的属性进行数据劫持

import Dep from './dep'
import {
  isObject
} from '../utils/util'

export function observe(value = {}, asRootData = true) {
  // 对传入的对象属性进行过滤，判断哪些需要进行数据劫持
  if (!isObject(value) || !value) {
    return
  }
  if (Array.isArray(value)) {
    return
  }
  // data会实例化一个Observe对象，并且挂载的object类型也会实例Observer
  return new Observer(value)
}

// 访问每个属性，将其转换为observer
// 为绑定对象的每个属性绑定getter/setter
// 收集依赖并触发更新
class Observer {
  constructor(value) {
    this.walk(value)
    // object类型会单独实例化一个Dep对象
    this.dep = new Dep()
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

// observe实例化时会为data中声明的每个属性挂载get和set方法
// 同时observe除了给对象类型单独实例化Dep外，还会在拦截处理每个属性时实例化Dep
// 使用watch监测对象时，Dep会与Watcher建立关联
// 监测某个具体属性时（使用watch），将Dep.target指向实例的watcher（建立关联），并解析path获取监测的属性值
// 多个watcher会被压入栈中依次监测
function defineReactive(obj = {}, key = '', val) {
  const dep = new Dep()
  const property = Reflect.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }
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
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        dep.depend()
        if (childObj /*observe类型*/ ) {
          // object类型需要单独建立关联
          childObj.dep.depend()
        }
      }
      // if (Dep.target) {
      //   dep.depend()
      //   if (childOb) {
      //     childOb.dep.depend()
      //   }
      // }
      return value
    },
    set(newVal) {
      const value = getter ? getter.call(obj) : val
      if (newVal === value || (newVal !== newVal && value !== value /*NaN或者Symbol类型*/ )) {
        return
      }
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      dep.notify()
    }
  })
}