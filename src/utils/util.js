export function isObject(obj) {
  return obj !== null && typeof obj === 'object'
}

// 设置数据属性的可枚举属性、value值
export function def(obj, key, val, enumerable) {
  Reflect.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

export function parsePath(path) {
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