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
    },
    /**
     *  A less bullet-proof but more efficient type check
     *  than Object.prototype.toString
     *  没有Object.prototype.toString严谨，但是比它高效
     */
    isObject: function (obj) {
        return typeof obj === OBJECT && obj && !Array.isArray(obj)
    },

    /**
     *  A more accurate but less efficient type check
     *  更准确的类型判断
     */
    isTrueObject: function (obj) {
        return toString.call(obj) === '[object Object]'
    },
    /**
    *  Most simple bind
    *  enough for the usecase and fast than native bind()
    *  使用call实现bind, 性能比bind优
    */
    bind: function (fn, ctx) {
        return function (arg) {
            return fn.call(ctx, arg)
        }
    },
    /**
    *  Make sure null and undefined output empty string
    *  当val为null,undefined的时候返回'', val为object， array的时候转为字符串
    */
    guard: function (val) {
        return val == null ?
            '' : (typeof val === 'object') ?
                JSON.stringify(val) : val
    },
    /**
    *  When setting value on the VM, parse possible numbers
    *  当val为 字符串number转为number
    */
    checkNumber: function (val) {
        return (isNaN(val) || val === null || typeof val === 'boolean')
            ? val : Number(val)
    },
    /**
     *  filter an array with duplicates into uniques
     *  数组去重, es6中也可以这样写: Array.from(new Set(arr))
     */
    unique: function (arr) {
        var hash = utils.hash(),
            i = arr.length,
            key, res = []
        while (i--) {
            key = arr[i]
            if (hash[key]) continue
            hash[key] = 1
            res.push(key)
        }
        return res
    },
    /**
     *  Convert the object to a ViewModel constructor
     *  if it is not already one
     *  把obj变成ViewModel的构造函数，obj的属性将添加ViewModel上，
     * 具体怎么添加可以看src/index.js上面的extend,
     */
    toConstructor: function (obj) {
        ViewModel = ViewModel || require('./viewmodel')
        return utils.isObject(obj)
            ? ViewModel.extend(obj) // ViewModel.extend方法在src/index.js上添加的, src/viewmodel没有这个方法
            : typeof obj === 'function'
                ? obj
                : null
    },
    /**
    *  Check if a filter function contains references to `this`
    *  If yes, mark it as a computed filter.
    *  检查filter函数里是否有this
    */
    checkFilter: function (filter) {
        if (THIS_RE.test(filter.toString())) {
            filter.computed = true
        }
    },
    /**
     *  convert certain option values to the desired format.
     *  把option里面的values转成预期的格式，比如component为ViewModel的构造函数
     */
    processOptions: function (options) {
        var components = options.components,
            partials = options.partials,
            template = options.template,
            filters = options.filters,
            key
        if (components) {
            for (key in components) {
                components[key] = utils.toConstructor(components[key])
            }
        }
        if (partials) {
            // for (key in partials) {
            //     partials[key] = utils.parseTemplateOption(partials[key])
            // }
        }
        if (filters) {
            for (key in filters) {
                utils.checkFilter(filters[key])
            }
        }
        if (template) {
            // options.template = utils.parseTemplateOption(template)
        }
    },
    /**
    *  used to defer batch updates
    *  延迟更新的实现
    */
    nextTick: function (cb, context) {
        if (context) {
            defer(utils.bind(cb, context), 0)
        }
        else {
            defer(cb, 0)
        }
    },
    /**
    *  add class for IE
    *  uses classList if available
    *  添加类名
    */
    addClass: function (el, cls) {
        if (el.classList) {
            el.classList.add(cls)
        } else {
            var cur = ' ' + utils.getClassName(el) + ' '
            if (cur.indexOf(' ' + cls + ' ') < 0) {
                el.setAttribute('class', (cur + cls).trim())
            }
        }
    },

    /**
     *  remove class for IE
     *  删除类名
     */
    removeClass: function (el, cls) {
        if (el.classList) {
            el.classList.remove(cls)
        } else {
            var cur = ' ' + utils.getClassName(el) + ' ',
                tar = ' ' + cls + ' '
            while (cur.indexOf(tar) >= 0) {
                cur = cur.replace(tar, ' ')
            }
            el.setAttribute('class', cur.trim())
        }
    },

    /**
     *  get class name for IE
     *  获取类名
     */
    getClassName: function (el) {
        return (el.className instanceof SVGAnimatedString ? el.className.baseVal : el.className)
    },
    /**
     *  Convert an object to Array
     *  used in v-repeat and array filters
     *  把对象转数组， 对象的key == 包裹对象的$key {a: 1} => [{$key: '1', value: 1}]
     */
    objectToArray: function (obj) {
        var res = [], val, data
        for (var key in obj) {
            val = obj[key]
            data = utils.isObject(val)
                ? val
                : { $value: val }
            data.$key = key
            res.push(data)
        }
        return res
    },
    /**
    *  log for debugging
    */
    log: function (msg) {
        if (config.debug && console) {
            console.log(msg)
        }
    },
    /**
    *  warnings, traces by default
    *  can be suppressed by `silent` option.
    */
    warn: function (msg) {
        if (!config.silent && console) {
            console.warn(msg)
            if (config.debug && console.trace) {
                console.trace()
            }
        }
    }
}