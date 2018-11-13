import {
  inBrowser
} from '../utils/util'

// 判断是否为一元标签
export const isUnaryTag = makeMap(
  'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
  'link,meta,param,source,track,wbr'
)

// 是否是段落式内容
// 每一个html元素都拥有一个或多个内容模型(content model)
// p标签是流式内容，p标签只允许包含段落式内容。
export const isNonPhrasingTag = makeMap(
  'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
  'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
  'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
  'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
  'title,tr,track'
)

// 允许非闭合标签
export const canBeLeftOpenTag = makeMap(
  'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'
)

// 将输入的字符串转为map，并返回一个判断key值是否在其中的函数
// 是否忽略大小写
export function makeMap(str, expectsLowerCase) {
  const map = Object.create(null)
  const list = str.split(',')
  list.forEach(i => {
    map[list[i]] = true
  })
  return expectsLowerCase ? val => map[val.toLowerCase()] : val => map[val]
}

let div

// 如果href中的url存在换行符，会在浏览器编译为&#10;
// 完整版vue并且编译真实dom时需要进行判断
function getShouldDecode(href) {
  div = div || document.createElement('div')
  div.innerHTML = href ? `<a href="\n"/>` : `<div a="\n"/>`
  return div.innerHTML.indexOf('&#10;') > 0
}
// 判断a属性后面包含换行符是否会转义
export const shouldDecodeNewlines = inBrowser ? getShouldDecode(false) : false
// href后面包含换行符是否会转义
export const shouldDecodeNewlinesForHref = inBrowser ? getShouldDecode(true) : false