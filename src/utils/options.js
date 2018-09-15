// options处理公共函数

// 针对不同键值做出不同处理
const strats = Object.create(null)

function defaultStrat(parent, child, key) {
  return child
}
// el属性处理的函数
strats.el = function (parent, child, key) {
  return child
}
// 对data处理的函数
strats.data = function (parent, child, key) {

  return child
}
// 合并mixins及extend扩展的options选项
// 处理options
function mergeOptions(parent = {}, child = {}) {
  normalizeProps(child)
  // 针对不同的键值，采用不同的merge策略
  const options = {}
  let key
  // 先忽略extend及mixins混合的options
  for (let key in child) {
    mergeField(key)
  }

  function mergeField(key) {
    // 提供对特定属性处理的函数
    let strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], key)
    // options[key] = strats[key](parent[key], child[key], key)
  }

  return options
}

// 统一props格式
function normalizeProps(params) {}

export {
  mergeOptions,
  normalizeProps
}