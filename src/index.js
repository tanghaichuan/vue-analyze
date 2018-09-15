import Mixin from './mixin'
import {
  initMixin
} from './init'

class Mue {
  constructor(options) {
    // 配置属性及方法
    this._init(options)
  }
}

initMixin(Mue)

export default Mue