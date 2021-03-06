//import Mue from './instance/index'
import Mue from './src/index';

var options = {
  el: '#app',
  template: `
  <ul>
    <div v-for="obj of list" class="box"></div>
    <li>
      <span class="text">文本</span>
    </li>
  </ul>
  `,
  data: {
    a: 2,
    b: 'aaa',
    c: [1, 2, 3],
    level: {
      d: 20,
      e: {
        f: 'ccc'
      }
    }
  },
  computed: {
    getA() {
      return this.a
    },
    cacheA() {
      return this.getA
    },
    getB: {
      get() {
        return this.b + this.a
      },
      set(val) {
        this.b = val
      }
    }
  },
  beforeCreate() {
    // console.log('beforeCreate');
  },
  created() {
    // this.$watch('getA',(newVal,oldVal)=>{
    //   console.log(newVal,oldVal);
    // })

    // this.$watch('level.e.f', (newVal, oldVal) => {
    //   console.log(1, `newVal:${newVal}`, `oldVal:${oldVal}`);
    // })
    // this.$watch('c', (newVal, oldVal) => {
    //   console.log(2, `newVal:${newVal}`, `oldVal:${oldVal}`);
    // })
    // this.c.splice(2, 1, 5)
    // this.c.push(4)
    // this.c.pop()
    // this.level.e.f = 'eeeeeee'
    // setTimeout(() => {
    //   this.level.e.f = 'qqqqqq'
    // }, 2000);
    // this.$watch('level', (newVal, oldVal) => {
    //   console.log(newVal, oldVal);
    // }, {
    //   deep: true
    // });
    // this.level.e.f = 'ddd'
  }
  // render() {

  // }
};

const Vm = new Mue(options);

//Vm.c.push(4);

// Vm.$watch('level.d', () => console.log('level发生了改变'));
// setTimeout(() => {
//   Vm.level.d = 10;
// }, 1000);

// Vm.$watch('c', () => console.log('c发生了改变'));
// setTimeout(() => {
//   Vm.c.push(4);
// }, 2000);