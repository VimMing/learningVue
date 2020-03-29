var openChar = '{',
    endChar = '}',
    ESCAPE_RE = /[-.*+?^${}()|[\]\/\\]/g, // 转义 -,.,*,+,^,$,{,},(,),|,[,],/,\
    Directive // lazy require

// 转译正则
function escapeRegex(str) {
    //$&即匹配的字符串
    return str.replace(ESCAPE_RE, '\\$&')
}

// 插值正则， 匹配 {{xxx}} 或 {{{xxxxx}}}
function buildInterpolationRegex() {
    var open = escapeRegex(openChar),
        end = escapeRegex(endChar)
    // 正则为: /{{{?(.+?)}?}}/
    return new RegExp(open + open + open + '?(.+?)' + end + '?' + end + end)
}
// 设置分割(定界)符
function setDelimiters(delimiters) {
    openChar = delimiters[0]
    endChar = delimiters[1]
    exports.delimiters = delimiters
    exports.Regex = buildInterpolationRegex()
}
/** 
 *  Parse a piece of text, return an array of tokens
 *  token types:
 *  1. plain string
 *  2. object with key = binding key
 *  3. object with key & html = true
 *  返回的数据是个数组，数组的内容分3类，
 * 字符串，对象(属性key)， 对象(属性key和属性html)
 *  比如 输入: "abc xb {{a}} xbc {{{b}}}" => 
 * 输出： ['abc xb ', {key: 'a'}, ' xbc ', {key: 'b', html: true}]
 * 具体可以看测试用例哦
 */
function parse(text) {
    if (!exports.Regex.test(text)) return null
    var m, i, token, match, tokens = []
    while (m = text.match(exports.Regex)) {
        i = m.index // 当前匹配到的位置
        if (i > 0) tokens.push(text.slice(0, i)) // 这是第一类 plain string
        token = { key: m[1].trim() } // 第二类 捕获组里面的, 即$1
        match = m[0] // 这个匹配的字符， 即$&
        token.html = match.charAt(2) === openChar &&
            match.charAt(match.length - 3) === endChar// 第三类 匹配 {{{x}}}
        tokens.push(token)
        text = text.slice(i + match.length) // 匹配下一段文本，类似于移动光标    
    }
    if (text.length) tokens.push(text) // 文本结尾
    return tokens
}

/**
 *  Parse an attribute value with possible interpolation tags
 *  return a Directive-friendly expression
 *
 *  e.g.  a {{b}} c  =>  "a " + b + " c"
 *  解析属性， 比如这样的 <div class="a {{b}} c"></div>
 * , attr为class里面的内容
 */
function parseAttr(attr) {
    Directive = Directive || require('./directive')
    var tokens = parse(attr)
    if (!tokens) return null
    if (tokens.length === 1) return tokens[0].key
    var res = [], token
    for (var i = 0, l = tokens.length; i < l; i++) {
        token = tokens[i]
        res.push(
            token.key
                ? inlineFilters(token.key)
                : ('"' + token + '"')
        )
    }
    return res.join('+')
}
/**
 *  Inlines any possible filters in a binding
 *  so that we can combine everything into a huge expression
 *  目前还没看directive的源码，上面的内容大概讲的是绑定内联可能的filter
 */
function inlineFilters(key) {
    if (key.indexOf('|') > -1) {
        var dirs = Directive.parse(key),
            dir = dirs && dirs[0]
        if (dir && dir.filters) {
            key = Directive.inlineFilters(
                dir.key,
                dir.filters
            )
        }
    }
    return '(' + key + ')'
}
exports.Regex = buildInterpolationRegex()
exports.parse = parse
exports.parseAttr = parseAttr
exports.delimiters = [openChar, endChar]