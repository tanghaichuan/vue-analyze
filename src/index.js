import Mixin from './mixin'
import {
  initMixin
} from './init'
import {
  stateMixin
} from './state'

class Mue {
  constructor(options) {
    // 配置属性及方法
    this._init(options)
  }
}

initMixin(Mue)
stateMixin(Mue)

export default Mue