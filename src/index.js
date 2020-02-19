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

module.exports = ViewModel

