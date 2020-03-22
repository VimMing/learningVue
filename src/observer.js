/********************************
 *  这是观察者模式里面的发布者。
 *  入口函数应该是watch或者observe, 下面是它的调用顺序，可以看出它是个递归函数， watch->watch
 *  watch -> (watchObject/watchArray) -> (convent & conventKey) -> observe -> watch
 *  observe->watch->(watchObject/watchArray) -> (convent & conventKey) -> observe
 *  1. watch函数里面分2部分， watchObject, watchArray 
 *  2. convent函数作用是给watch的数组或者对象，安装触发器(__emitter__)
 *  3. convertKey循环遍历数组或者对象，对里面的属性进行拦截， 对象是拦截set,get; 数组拦截mutate, 同时通过__emitter__发布消息（触发事件）
 *  4. 在上一步中，遍历的属性的值为对象或者数组，调用observe
 *  5. observe的主要作用是代理同时订阅(监听)，该属性发布的事件并传递事件， 同时调用watch, 重复上面的步骤
 **************************/


var Emitter = require('./emitter'),
    utils = require('./utils'),
    def = utils.defProtected,
    isObject = utils.isObject,
    isArray = Array.isArray,
    hasOwn = ({}).hasOwnProperty,
    oDef = Object.defineProperty,
    slice = [].slice,
    // fix for IE + __proto__ problem
    // define methods as inenumerable if __proto__ is present,
    // otherwise enumerable so we can loop through and manually
    // attach to array instances
    hasProto = ({}).__proto__

// Array Mutation Handlers & Augmentations ------------------------------------

// The proxy prototype to replace the __proto__ of
// an observed array
//  测试用例 observer.test.js 302行， Augmentations
var ArrayProxy = Object.create(Array.prototype)
def(ArrayProxy, '$set', function (index, data) {
    return this.splice(index, 1, data)[0]
}, !hasProto)

def(ArrayProxy, '$remove', function (index) {
    if (typeof index !== 'number') {
        index = this.indexOf(index)
    }
    if (index > -1) {
        return this.splice(index, 1)[0]
    }
}, !hasProto)
/**
 *  Intercep a mutation event so we can emit the mutation info.
 *  we also analyze what elements are added/removed and link/unlink
 *  them with the parent Array.
 */
// 对数组内置的一些方法设置拦截器
// 测试用例大约在166行observer.test.js 里Mutator Methods
// 针对push, pop , shift , unshift, splice, sort, reverse
function watchMutation(method) {
    def(ArrayProxy, method, function () {
        var args = slice.call(arguments),
            result = Array.prototype[method].apply(this, args),
            inserted, removed
        // determine new / removed elements
        if (method === 'push' || method === 'unshift') {
            inserted = args
        } else if (method === 'pop' || method === 'shift') {
            removed = [result]
        } else if (method === 'splice') {
            inserted = args.slice(2),
                removed = result
        }

        // link & unlink
        // 这2个方法针对添加的元素或者删除的元素是对象
        linkArrayElements(this, inserted)
        unlinkArrayElements(this, removed)

        // emit the mutation event
        // 触发mutate事件
        this.__emitter__.emit('mutate', '', this, {
            method: method,
            args: args,
            result: result,
            inserted: inserted,
            removed: removed
        })
        return result
    }, !hasProto)
}

// intercept mutation methods
// 测试用例： 1. should overwrite the native array mutator methods
;[
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
].forEach(watchMutation)

/**
 *  Link new elements to an Array, so when they change
 *  and emit events, the owner Array can be notified.
 */
// 当子元素发生变化时，触发事件， 通知父数组
// arr为父， items为子
function linkArrayElements(arr, items) {
    if (items) {
        var i = items.length, item, owners
        while (i--) {
            item = items[i]
            if (isWatchable(item)) { // 检测item是否是对象等
                // if object is not converted for observing
                // convert it...
                if (!item.__emitter__) {
                    // convert主要是为item添加emitter
                    convert(item)
                    // watch即通过get,set进行属性拦截，通过上面添加的emitter触发定义的事件
                    watch(item)
                }
                // 在emitter上面设置item的父结构
                owners = item.__emitter__.owners
                if (owners.indexOf(arr) < 0) {
                    owners.push(arr)
                }
            }
        }
    }
}

/**
 *  Unlink removed elements from the ex-owner Array.
 */
function unlinkArrayElements(arr, items) {
    if (items) {
        var i = items.length, item
        while (i--) {
            item = items[i]
            if (item && item.__emitter__) {
                var owners = item.__emitter__.owners
                // 我对vue这行代码有疑问，我觉得应该是owners.splice(owners.indexOf(arr), 1)
                // 应该只删一个元素， 而下面的把后面的元素全删了 
                if (owners) owners.splice(owners.indexOf(arr))
            }
        }
    }
}

// Object add/delete key augmentation -----------------------------------------
// 和数组类似，设置一个代理 ,假设obj为普通对象，经过observer处理后
// obj.__proto__为ObjProxy obj.__proto__.proto__为Object.prototype
var ObjProxy = Object.create(Object.prototype)

def(ObjProxy, '$add', function (key, val) {
    if (hasOwn.call(this, key)) return
    this[key] = val
    convertKey(this, key, true) // 这个方法是文件的核心方法，watch里面也有这个方法
}, !hasProto)

def(ObjProxy, '$delete', function (key) {
    if (!hasOwn.call(this, key)) return
    // trigger set events
    this[key] = void 0
    delete this[key]
    this.__emitter__.emit('delete', key)
}, !hasProto)

// Watch Helpers --------------------------------------------------------------

/***
 *
 * Check if a value is watchable
 */

function isWatchable(obj) {
    return typeof obj === 'object' && obj && !obj.$compiler
}

/**
 *  Convert an Object/Array to give it a change emitter.
 */
function convert(obj) {
    if (obj.__emitter__) return true
    var emitter = new Emitter()
    def(obj, '__emitter__', emitter)
    // 测试用例为：should emit for objects added later too
    emitter.on('set', function (key, val, propagate) {
        if (propagate) propagateChange(obj) // 通知父节点 obj.__emitter__.owners
    }).on('mutate', function () {
        propagateChange(obj)
    })
    emitter.values = utils.hash() // 赋值一个空对象
    emitter.owners = []
    return false
}

/**
 *  Propagate an array element's change to its owner arrays
 */
// 通知父节点
function propagateChange(obj) {
    var owners = obj.__emitter__.owners,
        i = owners.length
    while (i--) {
        owners[i].__emitter__.emit('set', '', '', true)
    }
}

/**
 *  Watch target based on its type
 */
function watch(obj) {
    if (isArray(obj)) {
        watchArray(obj) // 监听数组
    } else {
        watchObject(obj) // 对象
    }
}

/**
 *  Augment target objects with modified
 *  methods
 */
function augment(target, src) {
    if (hasProto) {
        target.__proto__ = src // 如果有隐式原型链，src里面的key不可枚举
    } else {
        for (var key in src) {
            def(target, key, src[key]) // 设置不可枚举
        }
    }
}

/**
 *  Watch an Object, recursive.
 */
function watchObject(obj) {
    augment(obj, ObjProxy) // obj.__proto__ === ObjProxy, obj.__proto__.__proto__ === Object.prototype
    for (var key in obj) {
        convertKey(obj, key)
    }
}

/**
 *  Watch an Array, overload mutation methods
 *  and add augmentations by intercepting the prototype chain
 */
function watchArray(arr) {
    augment(arr, ArrayProxy) // 注释同上
    linkArrayElements(arr, arr) // 遍历监听数组
}

/**
 *  Define accessors for a property on an Object
 *  so it emits get/set events.
 *  Then watch the value itself.
 */
function convertKey(obj, key, propagate) {
    var keyPrefix = key.charAt(0)
    if (keyPrefix === '$' || keyPrefix === '_') {
        return
    }
    // emit set on bind
    // this means when an object is observed it will emit
    // a first batch of set events.
    var emitter = obj.__emitter__,
        values = emitter.values
    init(obj[key], propagate)
    oDef(obj, key, {
        enumerable: true,
        configurable: true,
        get: function () {
            var value = values[key]
            if (pub.shouldGet) { // pub是exports对象的引用
                emitter.emit('get', key) // 触发事件
            }
            return value
        },
        set: function (newVal) {
            var oldVal = values[key]
            unobserve(oldVal, key, emitter)
            // 把oldVal上面有的属性而newVal上面没有的，拷贝放入newVal
            copyPaths(newVal, oldVal)
            // an immediate property should notify its parent
            // to emit set for itself too
            init(newVal, true)
        }
    })
    function init(val, propagate) {
        values[key] = val
        emitter.emit('set', key, val, propagate) // 触发事件
        if (isArray(val)) {
            emitter.emit('set', key + '.length', val.length, propagate)
        }
        observe(val, key, emitter) // 传emitter为父，代理子节点的set, get, mutate事件
    }
}
/**
 *  When a value that is already converted is
 *  observed again by another observer, we can skip
 *  the watch conversion and simply emit set event for
 *  all of its properties.
 */
// 单纯触发事件
function emitSet(obj) {
    var emitter = obj && obj.__emitter__
    if (!emitter) return
    if (isArray(obj)) {
        emitter.emit('set', 'length', obj.length)
    } else {
        var key, val
        for (key in obj) {
            val = obj[key]
            emitter.emit('set', key, val)
            emitSet(val)
        }
    }
}
/**
 *  Make sure all the paths in an old object exists
 *  in a new object.
 *  So when an object changes, all missing keys will
 *  emit a set event with undefined value.
 */
function copyPaths(newObj, oldObj) {
    if (!isObject(newObj) || !isObject(oldObj)) {
        return
    }
    var path, oldVal, newVal
    for (path in oldObj) {
        if (!(hasOwn.call(newObj, path))) {
            oldVal = oldObj[path]
            if (isArray(oldVal)) {
                newObj[path] = []
            } else if (isObject(oldVal)) {
                newVal = newObj[path] = {}
                copyPaths(newVal, oldVal)
            } else {
                newObj[path] = void 0
            }
        }
    }
}

/**
 *  walk along a path and make sure it can be accessed
 *  and enumerated in that object
 */
function ensurePath(obj, key) {
    var path = key.split('.'), sec
    for (var i = 0, d = path.length - 1; i < d; i++) {
        sec = path[i]
        if (!obj[sec]) {
            obj[sec] = {}
            if (obj.__emitter__) convertKey(obj, sec)
        }
        obj = obj[sec]
    }
    if (isObject(obj)) {
        sec = path[i]
        if (!(hasOwn.call(obj, sec))) {
            obj[sec] = void 0
            if (obj.__emitter__) convertKey(obj, sec)
        }
    }
}
// Main API Methods -----------------------------------------------------------
/**
 *  Observe an object with a given path,
 *  and proxy get/set/mutate events to the provided observer.
 */
// observer是父对象的__emitter__
function observe(obj, rawPath, observer) {
    if (!isWatchable(obj)) return
    var path = rawPath ? rawPath + '.' : '',
        alreadyConverted = convert(obj),
        emitter = obj.__emitter__
    // setup proxy listeners on the parent observer.
    // we need to keep reference to them so that they
    // can be removed when the object is un-observed.   
    observer.proxies = observer.proxies || {}
    var proxies = observer.proxies[path] = {
        get: function (key) {
            observer.emit('get', path + key)
        },
        set: function (key, val, propagate) {
            // 告诉父对象，这里变化了，不冒泡到上一层
            if (key) observer.emit('set', path + key, val)
            // also notify observer that the object itself changed
            // but only do so when it's a immediate property. this
            // avoids duplicate event firing.
            // 在convertKey里面的init中触发的propagate为true
            // 保证每一层只冒泡一层，避免重复触发事件
            // 可以看下测试用例， 比如 o = {b: {c: 2}} , e = new Emitter()
            // observe(o, 'test', e)
            // 给o.b.c 赋值， 比如赋值o.b.c = 3, e总共会触发3个事件，3个事件的path为 test.b.c, test.b, test.c
            if (rawPath && propagate) {
                observer.emit('set', rawPath, obj, true)
            }
        },
        // 涉及的测试用例: 1. should emit set for .length when it mutates
        mutate: function (key, val, mutation) {
            // if the Array is a root value
            // the key will be null
            var fixedPath = key ? path + key : rawPath,
                m = mutation.method
            observer.emit('mutate', fixedPath, val, mutation)
            // also emit set for Array's length when it mutates
            if (m !== 'sort' && m !== 'reverse') {
                observer.emit('set', fixedPath + '.length', val.length)
            }
        }
    }
    // attach the listeners to the child observer.
    // now all the events will propagate upwards.
    // 监听get, set, mutate, 执行函数的主要内容是父对象再次emit
    emitter.on('get', proxies.get)
        .on('set', proxies.set)
        .on('mutate', proxies.mutate)
    if (alreadyConverted) { // 对象已经被其他的监听了
        // for objects that have already been converted,
        // emit set events for everything inside
        emitSet(obj)
    } else {
        watch(obj) // 递归 watch -> (convert / convertKey) -> observe -> watch
    }
}

/**
 *  Cancel observation, turn off the listeners.
 */
function unobserve(obj, path, observer) {
    if (!obj || !obj.__emitter__) return
    path = path ? path + '.' : ''
    var proxies = observer.proxies[path]
    if (!proxies) return
    // turn off listeners
    obj.__emitter__.off('get', proxies.get)
        .off('set', proxies.set)
        .off('mutate', proxies.mutate)
    // remove reference
    observer.proxies[path] = null
}

// Expose API -----------------------------------------------------------------
var pub = module.exports = {
    // whether to emit get events
    // only enabled during dependency parsing
    shouldGet: false,
    observe: observe,
    unobserve: unobserve,
    ensurePath: ensurePath,
    copyPaths: copyPaths,
    watch: watch,
    convert: convert,
    convertKey: convertKey
}