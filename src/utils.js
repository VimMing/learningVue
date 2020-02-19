/*******************************
 *  vue-0.1的utils代码解析
 * ****************************/
// 取对象里内置的toString方法
var
    config = require('./config'),
    toString = ({}).toString,
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


var utils = module.exports = {

    /**
     *  Normalize keypath with possible brackets into dot notations
     *  将取值由括号取值变为点取值 ['a']['b'] => .a.b
     */
    normalizeKeypath: function (key) {
        return key.indexOf('[') < 0
            ? key
            : key.replace(BRACKET_RE_D, '.$1')
                .replace(BRACKET_RE_S, '.$1')
    },
    /**************************************
     * get a value from an object keypath
     * 根据keypath获取值
     * 知识点: 隐式转换，obj != null 等同 (obj !== null && obj !== undefined)
     ****************************************/
    get: function (obj, key) {
        key = utils.normalizeKeypath(key)
        var path = key.split('.'),
            d = -1, l = path.length
        while (++d < l && obj != null) {
            obj = obj[path[d]] === void 0 ? obj : obj[path[d]]
        }
        return obj
    },
    /******************************
     * set a value to an object keypath
     *  根据keypath赋值
     ***************************/
    set: function (obj, key, val) {
        key = utils.normalizeKeypath(key)
        var path = key.split('.'),
            d = -1,
            l = path.length - 1
        while (++d < l) {
            if (path[d]) {
                if (obj[path[d]] == null) {
                    obj[path[d]] = {}
                }
                obj = obj[path[d]]
            }
        }
        obj[path[d]] = val
    },
    /**
     *  Create a prototype-less object
     *  which is a better hash/map
     * 创建没有__proto__(原型链)的对象
     */
    hash: function () {
        return Object.create(null)
    },

    /**
     *  simple extend
     *  功能等同: Object.assign(obj, ext)
     */
    extend: function (obj, ext) {
        for (var key in ext) {
            if (obj[key] !== ext[key]) {
                obj[key] = ext[key]
            }
        }
        return obj
    },
    /**
    *  get an attribute and remove it.
    *  这个函数的作用大概是获取指令的值，然后删除指令， 比如 v-model, v-for等
    */
    attr: function (el, type) {
        var attr = config.prefix + '-' + type
        var val = el.getAttribute(attr)
        if (val != null) { // null || void 0
            el.removeAttribute(attr)
        }
        return val
    },
    /**
     *  Define an ienumerable property
     *  This avoids it being included in JSON.stringify
     *  or for...in loops.
     *  定义不可枚举的属性, 保护属性
     */
    defProtected: function (obj, key, val, enumerable, writable) {
        def(obj, key, {
            value: val,
            enumerable: enumerable, // enumerable 不传默认undefined, obj[key]不可枚举
            writable: writable, // 同上， 不可赋值.
            configurable: true
        })
    }
}