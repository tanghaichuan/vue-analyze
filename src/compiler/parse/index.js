import {
  parseHTML
} from './html-parse'

// 将html模板编译成AST语法树
// 编译过程：词法分析->句法分析->代码生成
export function parse(template, options) {

  // 对html做词法解析
  parseHTML(template, {
    expectHTML: options.expectHTML,
    isUnaryTag: options.isUnaryTag,
  })
}