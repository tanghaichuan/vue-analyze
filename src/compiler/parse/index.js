import {
  parseHTML
} from './html-parse'

// 将html模板编译成AST语法树
// 编译过程：词法分析->句法分析->代码生成
// parseHTML负责对模板进行词法分析
// 将模板中的开始标签，属性及属性值，内容，结束标签解析出来
// 若模板是浏览器中渲染的dom，则将转以后的字符转换回实体
// 忽略内容文本中的第一个空格符
// 忽略注释
// 
export function parse(template, options) {
  // 对html做词法解析
  parseHTML(template, {
    expectHTML: options.expectHTML,
    isUnaryTag: options.isUnaryTag,
    canBeLeftOpenTag: options.canBeLeftOpenTag,
    shouldDecodeNewlines: options.shouldDecodeNewlines,
    shouldDecodeNewlinesForHref: options.shouldDecodeNewlinesForHref,
    // 解析到的开始标签
    start(tag, attrs, unary) {
      console.log(tag, attrs, unary);
    },
    // 解析到的结束标签
    end(tag, attrs, unary) {
      console.log(tag, attrs, unary);
    },
    // 解析到的普通文本内容
    chars(text) {
      console.log(text);
    }
  })
}