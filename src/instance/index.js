import Mixin from './mixin'
import {
  initMixin
} from './init'
import {
  stateMixin
} from './state'
import {
  eventsMixin
} from './events'
import {
  lifecycleMixin
} from './lifecycle'
import {
  renderMixin
} from './render'

class Mue {
  constructor(options) {
    // 配置属性及方法
    this._init(options)
  }
}
// 混入_init方法
initMixin(Mue)
// 混入$data,$props,$set,$delete,$watch
stateMixin(Mue)
// 混入$on,$once,$off,$emit方法
eventsMixin(Mue)
// 混入_update,$forceUpdate,$destroy
lifecycleMixin(Mue)
// 混入$nextTick,_render
renderMixin(Mue)
export default Mue