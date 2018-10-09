// Vue会根据平台适配不同的版本，这里统一到完整版的入口

import Mue from './instance/index'
import {
  inBrowser
} from './utils/util'
import {
  mountComponent
} from './instance/lifecycle'


function query(el) {
  return typeof el === 'string' ? document.querySelector(el) : el
}

// vue有多个版本的$mount（适配不同平台）
Mue.prototype.$mount = function (el) {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el)
}

export default Mue