// 对data上挂载的属性进行数据劫持

import Dep from './dep'
import {
  isObject,
  def,
  hasOwn,
  isUndef,
  isPrimitive,
  isValidArrayIndex
} from '../utils/util'
import {
  hasProto
} from '../utils/env'
import {
  arrayMethods
} from './array'

// arrayMethods中的所有方法键名
const arrayKeys = Object.getOwnPropertyNames(arrayMethods)

function protoAugment(target, src, keys) {
  target.__proto__ = src
  // target = Object.create(src)
}

// IE10及以下的浏览器没有__proto__属性建立原型链。
// 需要显示的将方法写入数组类型中
function copyAugment(target, src, keys) {
  keys.forEach((key) => {
    def(target, key, src[key])
  })
}

export function observe(value = {}, asRootData = true) {
  // 对传入的对象属性进行过滤，判断哪些需要进行数据劫持
  if (!isObject(value) || !value) {
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
    this.value = value
    this.walk(value)
    // object类型会实例化一个Dep对象并挂载在__ob__属性中
    this.dep = new Dep()
    // __ob__存储observer对象
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      // 重写数组方法，IE11以上使用value.__proto = arrayMethods
      // IE11以下使用defineProperty并设置成不可枚举
      const augment = hasProto ? protoAugment : copyAugment
      augment(value, arrayMethods, arrayKeys)
      this.observeArray(value)
    }
  }
  // 劫持属性，为当前obj下面的属性绑定getter和setter
  // 只能劫持object类型的属性
  walk(obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }
  observeArray(array) {
    array.forEach(item => {
      observe(item)
    })
  }
}

// 将对象的属性由数据属性变为访问器属性
// 使用watch监测对象时，getter阶段Dep会与Watcher建立关联
// 监测某个具体属性时（使用watch），将Dep.target指向实例的watcher（建立关联），watcher会解析path获取监测的属性值
function defineReactive(obj = {}, key = '', val) {
  // 访问或者设置属性值时都会触发数据劫持
  // 给属性赋值时只会触发getter
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
  // 返回为对象实例的observe
  let childObj = observe(val);

  Reflect.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        // 在属性访问时将Watcher推入deps中
        dep.depend()
        /*observe类型*/
        if (childObj) {
          // object类型需要单独建立关联
          childObj.dep.depend()
          // 数组类型需要递归数组元素为每个元素绑定dep和watcher
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      return value
    },
    set(newVal) {
      // 在属性赋值阶段dep触发deps中存储的watcher队列
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

// 如果需要监测的元素是数组类型，则递归数组元素为每个元素建立dep与watcher的联系
function dependArray(value) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i]
    e && e.__ob__ && e.__ob__.dep.depend()
    if (Array.isArray(e)) {
      dependArray(e)
    }
  }
}

// 实际上将属性变更为访问器属性，可以监测到属性的改变，但新增的属性由于未在初始化时变更为访问器属性，所以监听不到。
// 为对象增加新的属性，如果没有建立dep和Watcher的关系则手动建立。
// 不能在根对象上使用$set即不能对Data进行set操作
export function set(target, key, val) {
  if (isUndef(target) || isPrimitive(target)) {
    return
  }
  // 数组类型使用Set时视为使用splice方法
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key)
    target.splice(key, 1, val)
    return val
  }
  // 使用set修改target中的原有属性
  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }
  // 获取对象上挂在的observe对象
  const ob = target.__ob__
  // 如果target没有挂载__ob__则进行赋值，再重新对target进行数据拦截
  if (!ob) {
    target[key] = val
    return val
  }

  // 单独解决数组或者对象属性的新增，是为了弥补属性未在初始化时变更为访问器属性的问题
  // 属性变动结束后，将属性变更为访问器属性（绑定自定义的getter/setter）
  defineReactive(ob.value, key, val)
  // 数据是在变动后变更的访问器属性，无法触发setter
  // 需要显示的通知watcher发生变动
  ob.dep.notify()
  return val
}

// 删除响应式对象中的属性，并
// 和set一样，del也不能删除根节点上的数据
export function del(target, key) {
  if (isUndef(target) || isPrimitive(target)) {
    return
  }
  // 删除的是数组可以直接触发响应
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1)
    return val
  }

  if (!hasOwn(target, key)) {
    return
  }
  delete target[key]

  const ob = target.__ob__
  if (!ob) {
    return
  }
  ob.dep.notify()
}