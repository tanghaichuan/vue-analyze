import {
  parseHTML
} from './html-parse'

// 匹配@或v-on开头的绑定事件
export const onRE = /^@|^v-on/
// 匹配指令或者绑定属性
export const dirRE = /^v-|^@|^:/
// 匹配for in 和for of
// [^]等价于[\W\S]等价于.
// ?:X 匹配自组X不作为结果输出
export const forAliasRE = /([^]*?)\s+(?:in|of)/
// 捕获第一个不包含字符,}和]的字符串，且该字符串前面有一个字符,
export const forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/
// 匹配以(开头或者以)结尾的
const stripParensRE = /^\(|\)$/g
// 匹配指令中的参数
const argRE = /:(.*)$/
// 匹配绑定属性
export const bindRE = /^:|^v-bind:/
// 匹配修饰符
const modifierRE = /\.[^.]+/g

// 创建节点描述
export function createASTElement(tag, attrs, parent) {
  return {
    type: 1,
    tag,
    attrsList: attrs,
    attrsMap: makeAttrsMap(attrs),
    parent,
    children: []
  }
}

// 对模板字符串进行词法分析，并创建抽象语法树
// 对于双元标签，AST中放置的节点以解析的开始节点为标准
export function parse(template, options) {
  // 用来存放非一元标签的开始标签
  const stack = []
  let currentParent
  let root
  let inVPre = false
  let inPre = false

  // 每当遇到一个结束标签时，或者遇到一元标签时调用该方法进行闭合操作。
  function closeElement(element) {
    // 
    if (element.pre) {

    }
  }

  // 对html做词法解析
  // 构建AST语法树
  parseHTML(template, {
    expectHTML: options.expectHTML,
    isUnaryTag: options.isUnaryTag,
    canBeLeftOpenTag: options.canBeLeftOpenTag,
    shouldDecodeNewlines: options.shouldDecodeNewlines,
    shouldDecodeNewlinesForHref: options.shouldDecodeNewlinesForHref,
    // 解析到的开始标签
    start(tag, attrs, unary) {
      let element = createASTElement(tag, attrs, currentParent)

      function checkRootConstraints(el) {
        // 检查当前模板是否只有一个根节点
        // 不能使用template或者slot作为根节点
        // 不能在根节点使用v-for
        if (el.tag === 'slot' || el.tag === 'template') {
          console.error(`Connot use ${el.tag} as root element`)
        }
        if (el.attrsMap.hasOwnProperty('v-for')) {
          // Vue内部使用的warnOnce避免输出多个warning
          console.error(`Cannot use v-for on stateful component root element`)
        }
      }

      if (!root) {
        root = element
        checkRootConstraints(root)
      } else if (!stack.length) {
        // stack为空表明当前模板已经解析完，如果存在root则表明当前模板有多个根节点
        // 出现多个根节点可能使用了 v-if v-else-if v-else情况

      }

      // 非根节点或者未解析完毕，则存在currentParent
      // currentParent始终指向栈顶元素
      if (currentParent) {
        // to do
      }

      // 非一元标签，将开始标签放入stack栈中
      // 一元标签 todo
      if (!unary) {
        currentParent = element
        stack.push(element)
      } else {

      }

      // console.log(tag, attrs, unary);
    },
    // 解析到的结束标签
    end(tag, attrs, unary) {
      // console.log(tag, attrs, unary);
    },
    // 解析到的普通文本内容
    chars(text) {
      // console.log(text);
    }
  })
}

// 将数组转换成hashmap对象
function makeAttrsMap(attrs) {
  const map = {}
  for (let i = 0, l = attrs.length; i < l; i++) {
    if (!map[attrs[i].name]) {
      map[attrs[i].name] = attrs[i].value
    }
  }
  return map
}