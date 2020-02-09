/*******************************
 *  vue-0.1的utils代码解析
 * ****************************/
// 取对象里内置的toString方法
var toString = ({}).toString,
    // window对象的alias(别名)
    win = window,
    // window.console方法的alias   
    console = win.console,
    // 设置alias    
    def = Object.defineProperty,
    //  设置固定值object
    OBJECT = 'object',
    //  匹配this文本， \w:匹配字母 ^为否 [^\w]为不是字母    
    THIS_RE = /[^\w]this[^\w]/,
    //  匹配类似这样的['xxxx']文本
    BRACKET_RE_S = /\['([^']+)'\]/g,
    //  匹配类似这样的["xxxx"]文本                  
    BRACKET_RE_D = /\["([^"]+)"\]/g,
    //      
    ViewModel // late def   

// 延迟函数    
var defer = win.requestAnimationFrame ||
    win.webkitRequestAnimationFrame ||
    setTimeout

/**
 *  Normalize keypath with possible brackets into dot notations
 *  将取值由括号取值变为点取值 o['a']['b'] => o.a.b
 */
function normalizeKeypath(key) {
    return key.indexOf('[') < 0
        ? key
        : key.replace(BRACKET_RE_D, '.$1')
            .replace(BRACKET_RE_S, '.$1')
}