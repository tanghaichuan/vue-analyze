import {
  baseOptions
} from './options'
import {
  extend
} from '../utils/util'
import {
  parse
} from './parse/index'
import {
  generate
} from './generate'
import {
  optimize
} from './optimizer'

// createCompilerCreator->createCompiler->compile
// 在针对不同平台编译ast时，compiler会产生冗余的代码，
// createCompilerCreator封装了通用的编译的代码
// options

function createFunction(code) {
  return new Function(code)
}

// 创建compileToFunctions函数
function createCompileToFunctionFn(compile) {
  const cache = Object.create(null)
  return function compileToFunctions(template, options, vm) {
    // vue会对new Function进行环境监察
    // 同时会将编译结果进行缓存
    const comiled = compile(template, options)

    function render(params) {

    }
    return {
      render
    }
  }
}

// 编译器创建者的创建者
// 返回创建编译器的函数
function createCompilerCreator(baseCompile) {

  return function createCompiler(baseOptions) {
    // 生成最终编译器的选项finalOptions
    // 对错误进行收集
    // 调用baseCompile编译模板

    function compile(template, options) {
      // 在baseCompile中对模板进行编译，生成适配平台的代码
      const finalOptions = Object.create(baseOptions)
      for (const key in options) {
        if (key !== 'modules' && key !== 'directives') {
          finalOptions[key] = options[key]
        }
      }
      const compiled = baseCompile(template, finalOptions)
      return compiled
    }
    // compile生成字符串形式的代码
    // compileToFunctions生成可执行代码
    return {
      compile,
      compileToFunctions: createCompileToFunctionFn(compile)
    }
  }
}

// 创建编译器
export const createCompiler = createCompilerCreator(function baseCompile(template, options) {
  // 调用parse函数将模板解析成ast语法树
  const ast = parse(template.trim(), options)
  // 调用optimize对ast进行优化
  optimize(ast, options)
  // 调用generate函数，将ast编译成适配不同平台运行的渲染函数
  const code = generate(ast, options)
})

// 在创建编译器时，通过baseOptions传递了基本编译器选项参数，
// 在使用编译器时，依然可以传入编译器选项
// 新的编译器选项会与旧选项进行覆盖或者融合
export const {
  compile, // 编译函数
  compileToFunctions // 将template转换成render函数
} = createCompiler(baseOptions);