// 判断是否为一元标签
export const isUnaryTag = makeMap(
  'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
  'link,meta,param,source,track,wbr'
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