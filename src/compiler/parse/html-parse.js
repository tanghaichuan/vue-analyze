import {
  makeMap,
  isNonPhrasingTag
} from '../utils';

// 对定义的html模板进行词法分析


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
// 包含/n /r
const encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#10|#9);/g;

// pre,textarea会忽略文本中的第一个换行符
// 即
// <pre>文本<pre>等价于
// <pre>
// 文本<pre>
const isIgnoreNewlineTag = makeMap('pre,textarea', true);
const shouldIgnoreFirstNewline = (tag, html) =>
  tag && isIgnoreNewlineTag(tag) && html[0] === '\n';

// 解码html字符实体
// 将转义后的字符转换为实体
function decodeAttr(value, shouldDecodeNewlines) {
  const re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodeAttr
  return value.replace(re, match => decodingMap[match]);
}

// 分析html词法
export function parseHTML(html, options) {
  // 用来检测标签是否闭合
  const stack = [];
  const expectHTML = options.expectHTML;
  // 是否是原生的一元标签
  const isUnaryTag = options.isUnaryTag || no;
  // 是否是非闭合标签
  const canBeLeftOpenTag = options.canBeLeftOpenTag || no
  // 当前字节流读取位置
  let index = 0;
  let last;
  // 表示stack栈顶元素
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
        if (comment.test(html)) {
          const commentEnd = html.indexOf('-->');
          if (commentEnd >= 0) {
            // 默认先剔除注释
            advance(commentEnd + 3);
            continue;
          }
        }

        if (conditionalComment.test(html)) {
          // 可能是条件注释节点
          const conditionalEnd = html.indexOf(']>');
          if (conditionalEnd >= 0) {
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
        if (endTagMatch) {
          const curIndex = index
          // ['</tag>',tag]
          // 剔除闭合标签
          advance(endTagMatch[0].length)
          // 注意curIndex是未剔除闭合tagName之前下标
          // index表示已经剔除下标
          parseEndTag(endTagMatch[1], curIndex, index);
          continue;
        }

        // 开始标签
        const startTagMatch = parseStartTag();
        if (startTagMatch) {
          handleStartTag(startTagMatch);

          if (shouldIgnoreFirstNewline(lastTag, html)) {
            // 去掉空格
            advance(1)
          }
          continue
        }
      }
      // 第一个字符是<但是非标签。如 <2
      // 或者第一个不是<但包含<。如1<2<3
      let text, rest, next
      // 123</p>
      if (textEnd >= 0) {
        // </p>
        rest = html.slice(textEnd)
        // 非标签走下面判断条件
        // 如1<2<3
        while (
          !endTag.test(rest) &&
          !startTagOpen.test(rest) &&
          !comment.test(rest) &&
          !conditionalComment.test(rest)
        ) {
          // 从<后面一位开始定位<
          next = rest.indexOf('<', 1)
          // next：2
          if (next < 0) break
          // 3
          textEnd += next
          // 2<3
          rest = html.slice(textEnd)
        }
        // 123
        text = html.substring(0, textEnd)
        // </p>
        advance(textEnd)
      }

      if (textEnd < 0) {
        text = html
        html = ''
      }

      if (options.chars && text) {
        options.chars(text)
      }

    } else {
      // <textarea>123</textarea>--->123</textarea>
      // 纯文本元素处理
      let endTagLength = 0
      const stackedTag = lastTag.toLowerCase()
      // \\s 匹配空字符
      // \\S 匹配非空字符
      // \\s\\S 匹配任意字符
      // *?指懒惰匹配。不会发生回溯，会从符合匹配结果的后面开始下一次匹配。
      // 捕获文本内容及后面的闭合标签
      const reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'))
      // 替换匹配的内容及闭合标签为空
      // 如 asdas<p>aaa
      // rest为aaa
      const rest = html.replace(reStackedTag, function (all, text, endTag) {
        endTagLength = endTag.length
        // 忽略文本内容中注释/选择注释
        // 捕获注释中的文本并替换整个注释
        if (!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
          text = text.replace(/<!\--([\s\S]*?)-->/g, '$1').replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1')
        }
        // textarea或者pre标签并且第一个字符是空格
        // 去掉空格
        if (shouldIgnoreFirstNewline(stackedTag, text)) {
          text = text.slice(1)
        }
        // 抛出匹配的字符文本内容
        if (options.chars) {
          options.chars(text)
        }
        return ''
      })
      // 更新下标到rest
      index += html.length - rest.length
      // 更新匹配的内容
      html = rest
      // 判断捕获到的闭合标签是否有开始标签
      // 若没有则将标签补全
      parseEndTag(stackedTag, index - endTagLength, index)

    }

    if (html === last) {
      // <div></div123
      // 如果此时stack中不为空，则表明表明文本内容没有被标签包含
      options.chars && options.chars(html)
      break;
    }
  }
  // 处理stack中剩余的标签
  parseEndTag()

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
      let end, attr;
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
    if (expectHTML) {
      // p标签只允许包含段落式内容
      if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
        // 当p标签包含非段落式内容时，比如<p><h1></h1></p>
        // 调用parseEndTag闭合p标签
        // <p><h1></h1></p>---><p></p><h2></h2></p>---><p></p><h2></h2><p></p>
        parseEndTag(lastTag)
      }
      // 比如
      // <p>a
      // <p>b
      // 当遇到两个相同的非闭合标签p时，会立即关闭第二个p标签
      if (canBeLeftOpenTag(tagName) && lastTag === tagName) {
        parseEndTag(tagName)
      }
    }

    // 是否是规定的一元标签
    // <component /> 为undefined
    const unary = isUnaryTag(tagName) || !!unarySlash;
    const l = match.attrs.length;
    const attrs = new Array(l);
    // 遍历attrs里面的每个字段
    // 格式化attrs数组
    // 格式化后的数据只包含name和value两个字段，其中name是属性名，value是属性值，并对属性值进行html实体解码。
    for (let i = 0; i < l; i++) {
      const args = match.attrs[i];
      const value = args[3] || args[4] || args[5] || '';
      const shouldDecodeNewlines = tagName === 'a' && args[1] === 'href' ? options.shouldDecodeNewlinesForHref : options.shouldDecodeNewlines
      attrs[i] = {
        name: args[1],
        value: decodeAttr(value, shouldDecodeNewlines)
      };
    }
    if (!unary) {
      stack.push({
        tag: tagName,
        lowerCasedTag: tagName.toLowerCase(),
        attrs: attrs
      });
      lastTag = tagName;
    }

    if (options.start) {
      options.start(tagName, attrs, unary, match.start, match.end)
    }
  }

  // 解析闭合标签
  // 分析模板字符串是否缺乏闭合标签
  // 处理stack栈中剩余的标签
  // 解析</br>与</p>标签，与浏览器行为相同
  function parseEndTag(tagName, start, end) {
    // pos判断html是否缺少结束标签
    // lowerCasedTagName变量用来存储tagName的小写版。
    let pos, lowerCasedTagName
    if (start == null) {
      start = index
    }
    if (end == null) {
      end = index
    }

    if (tagName) {
      lowerCasedTagName = tagName.toLowerCase()
    }

    if (tagName) {
      // 寻找当前解析的结束标签所对应的开始标签在stack栈中的位置。
      // 从栈顶开始寻找
      pos = stack.slice().reverse().findIndex(item => item.lowerCasedTag === lowerCasedTagName)
    } else {
      // parseEndTag未传参时，pos为0
      pos = 0
    }
    if (pos >= 0) {
      stack.slice().reverse().forEach(item => {
        if (options.end) {
          // 如果存在比pos大的下标，那么下标对应的标签一定未闭合
          // 调用end将标签闭合
          options.end(item.tag, start, end)
        }
      })
      // 将未闭合的标签移除栈
      // 更新栈顶标签
      stack.length = pos
      lastTag = (pos && stack[pos - 1].tag)
    } else if (lowerCasedTagName === 'br') {
      // 当未在stack栈中找到对应的开标签
      // 表明当前标签为</br>或者</p>标签
      if (options.start) {
        // </br>变更为<br>
        options.start(tagName, [], true, start, end)
      }
    } else if (lowerCasedTagName === 'p') {
      // </p>变更为<p></p>
      if (options.start) {
        options.start(tagName, [], false, start, end)
      }
      if (options.end) {
        options.end(tagName, start, end)
      }
    }
  }
}