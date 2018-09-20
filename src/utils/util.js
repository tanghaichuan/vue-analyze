export function isObject(obj) {
  return obj !== null && typeof obj === 'object'
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