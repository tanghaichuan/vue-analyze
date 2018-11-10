import {
  makeMap
} from '../utils';

// 匹配属性需要考虑的场景：
// 1.使用双引号 class="cls"
// 2.使用单引号 class='cls'
// 3.不适用引号 class=cls
// 4.单独使用 disabled
// 分组捕获，先捕获属性名，再捕获=号，最后捕获属性值（"cls"、'cls'、cls），以" ' 或 空字符等开头的字符串
const attribute = /\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
// An XML name that does not contain a colon (:)
// 不包含冒号的XML名称。注：XML标签名由前缀、冒号：、以及标签名称组成的。<前缀:标签名称>
const ncname = '[a-zA-Z_][\\w\\-\\.]*';
// 合法的标签名称，由前缀、冒号、名称组成
// 捕获整个标签名称
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
// 捕获匹配的起始标签名称
const startTagOpen = new RegExp(`^<${qnameCapture}`);
// 捕获标签结束的部分>或者/>
const startTagClose = /^\s*(\/?)>/;
// 捕获标签名称
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
// 匹配DOCTYPE标签，忽略大小写
const doctype = /^<!DOCTYPE [^>]+>/i;
// 匹配<!\--开头的代码
// vue内联到html代码中时避免被认为是注释（以<!--开头）
const comment = /^<!\--/;
// 匹配条件注释
const conditionalComment = /^<!\[/;

// 纯文本标签单独处理
export const isPlainTextElement = makeMap('script,style,textarea', true);
const reCache = {};

const decodingMap = {
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&amp;': '&',
  '&#10;': '\n',
  '&#9;': '\t'
};

const encodeAttr = /&(?:lt|gt|quot|amp);/g;
const encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#10|#9);/g;

// pre,textarea会忽略文本中的第一个换行符
// 即
// <pre>文本<pre>等价于
// <pre>
// 文本<pre>
const isIgnoreNewlineTag = makeMap('pre,textarea', true);
const shouldIgnoreFirstNewline = (tag, html) =>
  tag && isIgnoreNewlineTag(tag) && html[0] === '\n';

// 解码html实体
function decodeAttr(value, shouldDecodeNewlines) {}

// 分析html词法
export function parseHTML(html, options) {
  // 用来检测标签是否闭合
  const stack = [];
  const expectHTML = options.expectHTML
  // 是否是原生的一元标签
  const isUnaryTag = options.isUnaryTag || no
  // 当前字节流读取位置
  let index = 0;
  let last;
  let lastTag;
  while (html) {
    // last会在循环结束后与html比较，若不变则为纯文本
    last = html;

    if (!lastTag || !isPlainTextElement(lastTag)) {
      // 非纯文本内容

      // 查看<出现的位置
      let textEnd = html.indexOf('<');
      // <出现在开头
      // 可能是<!-- -->
      // 可能是条件注释节点<![]>
      // 可能是doctype <!DPCTYPE>
      // 可能是结束标签</xx>
      // 可能是开始标签<xx>
      // 可能是文本<xasdas
      if (textEnd === 0) {
        // 可能是注释节点
        if (comment.text(html)) {
          const commentEnd = html.indexOf('-->');
          if (commentEnd > 0) {
            // 默认先剔除注释
            advance(commentEnd + 3);
            continue;
          }
        }

        if (conditionalComment.test(html)) {
          // 可能是条件注释节点
          const conditionalEnd = html.indexOf(']>');
          if (conditionalEnd > 0) {
            // 默认剔除条件注释节点
            advance(conditionalEnd + 2);
            continue;
          }
        }

        const doctypeMatch = html.match(doctype);
        if (doctypeMatch) {
          // doctype节点
          advance(doctypeMatch[0].length);
          continue;
        }

        // 结束标签
        const endTagMatch = html.match(endTag);
        if (endTagMatch) {}

        // 开始标签
        const startTagMatch = handleStartTag();
        if (startTagMatch) {
          startTagMatch(startTagMatch);
        }
      }

      if (textEnd >= 0) {}

      if (textEnd < 0) {}
    } else {}
  }
  console.log('<div></div>'.match(startTagClose));

  // 剔除字符串
  // n 截取开始位置
  function advance(n) {
    // 存储字节流读取位置
    index += n;
    html = html.substring(n);
  }

  // 解析开始标签
  // 比如<div></div>
  // 捕获后内容：['<div','div']
  function parseStartTag() {
    const start = html.match(startTagOpen);
    if (start) {
      const match = {
        tagName: start[1],
        attrs: [],
        start: index
      };
      advance(start[0].length);
      let end, arrt;
      // 当html在开始标签闭合前存在attribute属性
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(attribute))
      ) {
        // 比如<div v-for="item in list"></div>
        // 捕获内容：['item in list', 'v-for', '=', 'list', undefined, undefined]
        advance(attr[0].length);
        match.attrs.push(attr);
      }
      if (end) {
        // 该开始标签是否是一元标签
        // 如 <br /> 捕获内容: ['/>', '/']
        match.unarySlash = end[1];
        advance(end[0].length);
        match.end = index;
        return match;
      }
    }
  }

  // 处理开始标签的解析结果
  function handleStartTag(match) {
    const tagName = match.tagName;
    const unarySlash = match.unarySlash;

    // 是否是规定的一元标签
    const unary = isUnaryTag(tagName) || !!unarySlash


  }
}