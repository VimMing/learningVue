var config = require('./config'),
    ViewModel = require('./viewmodel'),
    utils = require('./utils');
/**
*  Set config options
*/
ViewModel.config = function (opts, val) {
    // 如果opts的类型是字符串， 就取值， 如果是对象就扩展， 如果val不为空就设置值
    if (typeof opts === 'string') {
        if (val === undefined) {
            return config[opts]
        } else {
            config[opts] = val
        }
    } else {
        utils.extend(config, opts)
    }
    return this
}

ViewModel.extend = extend
function extend (options) {
    var ParentVM = this
    var ExtendedVM = function (opts, asParent) {
        if (!asParent) {
            opts = inheritOptions(opts, options, true)
        }
        ParentVM.call(this, opts, true)
    }
    var proto = ExtendedVM.prototype = Object.create(ParentVM.prototype) // ExtendedVM.prototype继承ParentVM.prototype 
    utils.defProtected(proto, 'constructor', ExtendedVM) // prototype的constructor指向构造函数
    return ExtendedVM
}

function inheritOptions(opts){

    return opts
}
module.exports = ViewModel

