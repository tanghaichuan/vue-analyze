export function isObject(obj) {
  return obj !== null && typeof obj === 'object'
}

// 设置数据属性的可枚举、value值
export function def(obj, key, val, enumerable) {
  Reflect.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

export function parsePath(path) {
  // 匹配数字字母下划线汉字.  不能存在非法字符
  if (!/[^\W.$]/.test(path)) {
    return
  }
  let segements = path.split('.')
  return function (obj) {
    segements.forEach((index) => {
      if (!obj) {
        return
      }
      // 递归对象查询
      obj = obj[index]
    })
    return obj
  }
}

export function isUndef(v) {
  return v === undefined || v === null
}

// 判断该值是否为原始类型值
export function isPrimitive(value) {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'symbol' ||
    typeof value === 'boolean'
  )
}

// 索引满足条件
// 大于0的整数并且不是无限的
export function isValidArrayIndex(val) {
  var n = parseFloat(String(val));
  return n >= 0 && Math.floor(n) === n && isFinite(val)
}

// 判断对象本身是否有某属性
const hasOwnProperty = Reflect.hasOwnProperty
export function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key)
}

// 判断是否是浏览器环境
export const inBrowser = typeof window !== 'undefined';

// 判断构造函数是否由浏览器提供
export function isNative(Ctor) {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
}

export function extend(to, _from) {
  for (var key in _from) {
    to[key] = _from[key];
  }
  return to
}


// 兼容Set
let _Set
if (typeof Set !== 'undefined' && isNative(Set)) {
  _Set = Set
} else {
  _Set = class Set {
    constructor() {
      this.set = Object.create(null)
    }
    has(key) {
      return this.set[key] === true
    }
    add(key) {
      return this.set[key] === true
    }
    clear() {
      this.set = Object.create(null)
    }
  }
}

export {
  _Set
}
