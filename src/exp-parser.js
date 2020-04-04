// exp-parser.js主要功能为把表达式转成可以执行的函数。
// 比如把 a + b 转换成 () => {return this.a + this.b}
var utils = require('./utils'),
    STR_SAVE_RE = /"(?:[^"\\]|\\.)*"|'([^'\\]|\\.)*'/g,
    STR_RESTORE_RE = /"(\d+)"/g,
    NEWLINE_RE = /\n/g,
    CTOR_RE = new RegExp('constructor'.split('').join('[\'"+, ]*')),
    UNICODE_RE = /\\u\d\d\d\d/

// 看代码的那天正好得知司徒正美大佬去了只有二次元的世界 R.I.P。
// Variable extraction scooped from https://github.com/RubyLouvre/avalon

// javascript中的关键字
var KEYWORDS =
    // keywords
    'break, case, catch,continue,debugger,default,delete,do,else,false' +
    ',finally,for,function,if,in,instanceof,new,null,return,switch,this' +
    ',throw,true,try,typeof,var,void,while,with,undefined' +
    // reserved
    ',abstract,boolean,byte,char,class,const,double,enum,export,extends' +
    ',package,private,protected,public,short,static,super,synchronized' +
    'throws,transient,volatile' +
    // ECMA 5 - use strict
    ',arguments,let,yield' +
    //allow using Math in expressions
    ',Math',
    // 匹配关键字
    KEYWORDS_RE = new RegExp(["\\b" + KEYWORDS.replace(/,/g, '\\b|\\b')].join('|')),
    // 匹配 "/*xxxx*/", "//", 双引号和其中的内容， 单引号和其中的内容， 匹配".xxx" 匹配“{ xxx:”
    REMOVE_RE = /\/\*(?:.|\n)*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|'[^']*'|"[^"]*"|[\s\t\n]*\.[\s\t\n]*[$\w\.]+|[\{,]\s*[\w\$_]+\s*:/g,
    SPLIT_RE = /[^\w$]+/g,
    // 匹配已数字开头
    NUMBER_RE = /\b\d[^,]*/g,
    // 匹配代码边界‘，’
    BOUNDARY_RE = /^,+|,+$/g


/**
 *  Strip top level variable names from a snippet of JS expression
 */
// 提取表达式中的变量
function getVariables(code) {
    code = code.replace(REMOVE_RE, '')
        .replace(SPLIT_RE, ',')
        .replace(KEYWORDS_RE, '')
        .replace(NUMBER_RE, '')
        .replace(BOUNDARY_RE, '')
    return code ? code.split(/,+/) : []
}


/**
 *  A given path could potentially exist not on the
 *  current compiler, but up in the parent chain somewhere.
 *  This function generates an access relationship string
 *  that can be used in the getter function by walking up
 *  the parent chain to check for key existence.
 *
 *  It stops at top parent if no vm in the chain has the
 *  key. It then creates any missing bindings on the
 *  final resolved vm.
 */
// 确定和跟踪变量来着哪个作用域 
function traceScope(path, compiler, data) {
    var rel = '',
        dist = 0,
        self = compiler

    if (data && utils.get(data, path) !== undefined) {
        // hack: temporarily attached data
        return '$temp.'
    }
    while (compiler) {       
        if (compiler.hasKey(path)) {
            break
        } else {
            compiler = compiler.parent
            dist++
        }
    }
    if (compiler) {
        while (dist--) {
            rel += '$parent.'
        }
        if (!compiler.bindings[path] && path.charAt(0) !== '$') {
            compiler.createBinding(path)
        }
    } else {
        self.createBinding(path)
    }
    return rel
}

/**
 *  Create a function from a string...
 *  this looks like evil magic but since all variables are limited
 *  to the VM's data it's actually properly sandboxed
 */
// 把表达式转成函数
function makeGetter(exp, raw) {
    var fn
    try {
        fn = new Function(exp)
    } catch (e) {
        utils.warn('Error parsing expression: ' + raw)
    }
    return fn
}

/**
 *  Escape a leading dollar sign for regex construction
 */
// 把“$”转译
function escapeDollar(v) {
    return v.charAt(0) === '$' ? '\\' + v : v
}

/**
 *  Parse and return an anonymous computed property getter function
 *  from an arbitrary expression, together with a list of paths to be
 *  created as bindings.
 */
exports.parse = function (exp, compiler, data) {
    // unicode and 'constructor' are not allowed for XSS security.
    if (UNICODE_RE.test(exp) || CTOR_RE.test(exp)) {
        utils.warn('Unsafe expression: ' + exp)
        return
    }
    // extract variable names
    var vars = getVariables(exp)
    if (!vars.length) {
        return makeGetter('return ' + exp, exp)
    }
    vars = utils.unique(vars)
    // console.log('vars: ', vars)
    var accessors = '',
        has = utils.hash(),
        strings = [],
        // construct a regex to extract all valid variable paths
        // ones that begin with "$" are particularly tricky
        // because we can't use \b for them
        pathRE = new RegExp("[^$\\w\\.](" + vars.map(escapeDollar).join('|') + ")[$\\w\\.]*\\b", 'g'),
        // 加空格是为了 [^$\w\.]可以获得匹配
        body = (' ' + exp).replace(STR_SAVE_RE, saveStrings)
            .replace(pathRE, replacePath).replace(STR_RESTORE_RE, restoreStrings)
    body = accessors + 'return ' + body
    // console.log(body)
    function saveStrings(str) {
        console.log(str)
        // 把表达式里面的字符串存起来
        var i = strings.length
        // escape newlines in strings so the expression
        // can be correctly evaluated
        strings[i] = str.replace(NEWLINE_RE, '\\n')
        return '"' + i + '"'
    }

    function replacePath(path) {
        // keep track of the first char
        // 变量c的内容为：[^$\w\.]匹配内容， 通常为 “ ”， “（”
        var c = path.charAt(0)
        path = path.slice(1)
        var val = "this." + traceScope(path, compiler, data) + path
        if (!has[path]) {
            accessors += val + ';'
            has[path] = 1
        }
        return c + val
    }

    // 还原字符串
    function restoreStrings(str, i) {
        return strings[i]
    }
    return makeGetter(body, exp)
}

/**
 *  Evaluate an expression in the context of a compiler.
 *  Accepts additional data.
 */

exports.eval = function (exp, compiler, data) {
    var getter = exports.parse(exp, compiler, data), restoreStrings
    if (getter) {
        // hack: temporarily attach the additional data so
        // it can be accessed in the getter

        compiler.vm.$temp = data
        res = getter.call(compiler.vm)
        delete compiler.vm.$temp
    }
    return res
}
