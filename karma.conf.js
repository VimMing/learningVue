/*****************************/
// http://www.ruanyifeng.com/blog/2015/12/a-mocha-tutorial-of-examples.html
// https://github.com/chaijs/chai // 断言库
// https://karma-runner.github.io/4.0/config/plugins.html
// https://github.com/webpack-contrib/karma-webpack  // karma-webpack的地址
/*******************************/
var webpackConfig = require('./webpack.test')
delete webpackConfig.entry
webpackConfig.devtool = 'inline-source-map'
module.exports = function (config) {
  config.set({
    frameworks: ['mocha'],

    files: [
      'test/index.js'
    ],
    preprocessors: {
      'test/index.js': ['webpack', 'sourcemap']
    },
    browsers: ['Chrome'],
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true
    },
    autoWatch: true
  })
}