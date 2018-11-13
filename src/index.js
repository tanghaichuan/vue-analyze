// Vue会根据平台适配不同的版本，这里统一到完整版的入口

import Mue from './instance/index';
import {
  inBrowser
} from './utils/util';
import {
  mountComponent
} from './instance/lifecycle';

import {
  compileToFunctions
} from './compiler';

import {
  shouldDecodeNewlines,
  shouldDecodeNewlinesForHref,
} from './compiler/utils'

function query(el) {
  return typeof el === 'string' ? document.querySelector(el) : el;
}

// vue有多个版本的$mount（适配不同平台）
// 这里选用完整版（$mount具有编译模板功能）
// 将template字符串转换为渲染函数并赋值给$options.render函数
Mue.prototype.$mount = function (el) {
  el = el && inBrowser ? query(el) : undefined;

  const options = this.$options;
  // 将template编译成render函数
  if (!options.render) {
    let template = options.template;
    // 将html转换成字符串
    // if (el) {
    //   template = getOuterHTML(el);
    // }

    if (template) {
      const {
        render,
        staticRenderFns
      } = compileToFunctions(
        template, {
          shouldDecodeNewlines,
          shouldDecodeNewlinesForHref,
        },
        this
      );

      options.render = render;
      options.staticRenderFns = staticRenderFns;
    }
  }

  return mountComponent(this, el);
};

// dom to string
function getOuterHTML(el) {
  if (el.outerHTML) {
    return el.outerHTML;
  } else {
    const container = document.createElement('div');
    container.appendChild(el.cloneNode(true)); // true赋值子节点  false只赋值本身
    return container.innerHTML;
  }
}

export default Mue;