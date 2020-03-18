// 触发器
var slice = [].slice

function Emitter (ctx) {
    this._ctx = ctx || this
}

var EmitterProto = Emitter.prototype

// 事件监听, 把事件处理函数push到 this._cbs[event]
EmitterProto.on = function (event, fn) {
    this._cbs = this._cbs || {}
    ;(this._cbs[event] = this._cbs[event] || [])
        .push(fn)
    return this
}
// 监听处理一次
EmitterProto.once = function (event, fn) {
    var self = this
    this._cbs = this._cbs || {}
    // 包裹原函数， 内容为先取消包裹函数， 后执行fn
    function on () {
        self.off(event, on)
        fn.apply(this, arguments)
    }

    on.fn = fn
    this.on(event, on)
    return this
}
// 取消的逻辑
EmitterProto.off = function (event, fn) {
    this._cbs = this._cbs || {}

    // all， 不传参数，就全部取消
    if (!arguments.length) {
        this._cbs = {}
        return this
    }

    // specific event
    var callbacks = this._cbs[event]
    if (!callbacks) return this

    // remove all handlers， 取消这个事件上绑定的所有函数
    if (arguments.length === 1) {
        delete this._cbs[event]
        return this
    }

    // remove specific handler, 取消某一个
    var cb
    for (var i = 0; i < callbacks.length; i++) {
        cb = callbacks[i]
        // cb为on, cb.fn为once的处理函数
        if (cb === fn || cb.fn === fn) { 
            callbacks.splice(i, 1)
            break
        }
    }
    return this
}
// emit和applyEmit为函数执行。
/**
 *  Function.call 的效率高于Function.apply
 *  The internal, faster emit with fixed amount of arguments
 *  using Function.call
 */
EmitterProto.emit = function (event, a, b, c) {
    this._cbs = this._cbs || {}
    var callbacks = this._cbs[event]

    if (callbacks) {
        callbacks = callbacks.slice(0)
        for (var i = 0, len = callbacks.length; i < len; i++) {
            callbacks[i].call(this._ctx, a, b, c)
        }
    }

    return this
}

/**
 *  The external emit using Function.apply
 */
EmitterProto.applyEmit = function (event) {
    this._cbs = this._cbs || {}
    var callbacks = this._cbs[event], args

    if (callbacks) {
        callbacks = callbacks.slice(0)
        args = slice.call(arguments, 1)
        for (var i = 0, len = callbacks.length; i < len; i++) {
            callbacks[i].apply(this._ctx, args)
        }
    }

    return this
}

module.exports = Emitter