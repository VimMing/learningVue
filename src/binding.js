// 这是我看的第个文件， 我还不知道，binding在vue里面扮演这什么角色，
// 我就说下我的理解，这个里面最重要的方法是update, 
// 这里面的逻辑分3块， 第一块更新binding上面的值，
// 第二更新directive上面的值
// 第三块更新subs上面的值， subs应该就是compute计算属性的依赖
//对其中的代码有疑惑的，强烈建议你可以看测试用例， 帮助你理解。
var Batcher = require('./batcher'),
    bindingBatcher = new Batcher(),
    bindingId = 1


/**
 *  Binding class.
 *
 *  each property on the viewmodel has one corresponding Binding object
 *  which has multiple directive instances on the DOM
 *  and multiple computed property dependents
 */
function Binding(compiler, key, isExp, isFn) {
    this.id = bindingId++
    this.value = void 0
    this.isExp = !!isExp // 是否是表达式
    this.isFn = isFn // 是否是函数
    this.root = !this.isExp && key.indexOf('.') === -1 // 根
    this.compiler = compiler // 编译器
    this.key = key //
    this.dirs = [] // directive 指令
    this.subs = []
    this.deps = []
    this.unbound = false // 是否解绑
}

var BindingProto = Binding.prototype

/**
 *  Update value and queue instance updates.
 */

BindingProto.update = function (value) {
    // 如果不是计算属性 或者 是函数，直接赋值
    if (!this.isComputed || this.isFn) {
        this.value = value
    }
    // directives subs不为空
    if (this.dirs.length || this.subs.length) {
        var self = this
        // 进入异步队列，批量处理
        bindingBatcher.push({
            id: this.id,
            execute: function () {
                if (!self.unbound) {
                    self._update()
                }
            }
        })
    }
}

/**
*  Actually update the directives.
*/
BindingProto._update = function () {
    var i = this.dirs.length,
        value = this.val()
    while (i--) {
        this.dirs[i].$update(value)
    }
    this.pub() // public 应该是广播， 通知subs更新, sub指的是以来这个bind的compute值
}

/**
 *  Return the valuated value regardless
 *  of whether it is computed or not
 */
BindingProto.val = function () {
    return this.isComputed && !this.isFn ?
        this.value.$get() : this.value
}

/**
 *  Notify computed properties that depend on this binding
 *  to update themselves
 */
BindingProto.pub = function () {
    var i = this.subs.length
    while (i--) {
        this.subs[i].update()
    }
}

/**
 *  Unbind the binding, remove itself from all of its dependencies
 */
BindingProto.unbind = function () {
    // Indicate this has been unbound.
    // It's possible this binding will be in
    // the batcher's flush queue when its owner
    // compiler has already been destroyed. 
    this.unbound = true
    var i = this.dirs.length
    while (i--) {
        this.dirs[i].$unbind()
    }
    i = this.deps.length
    var subs
    // subs为依赖this, 的compute属于，
    // 所以当unbind的时候，应该取掉依赖
    while (i--) {
        subs = this.deps[i].subs
        var j = subs.indexOf(this)
        if (j > -1) subs.splice(j, 1)
    }
}

module.exports = Binding