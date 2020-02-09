/*****************************/
// http://www.ruanyifeng.com/blog/2015/12/a-mocha-tutorial-of-examples.html
// https://github.com/chaijs/chai // 断言库
// https://karma-runner.github.io/4.0/config/plugins.html
// https://github.com/webpack-contrib/karma-webpack  // karma-webpack的地址
/*******************************/
var webpackConfig = require('./webpack.test.config')
delete webpackConfig.entry // 不需要入口文件， 
webpackConfig.devtool = 'inline-source-map' // devtool 由 karma-sourcemap-loader处理
module.exports = function (config) {
  config.set({
    frameworks: ['mocha'], // 测试框架 mocha

    files: [
      'test/index.js' // 测试入口文件 test下面的index.js
    ],
    preprocessors: {
      'test/index.js': ['webpack', 'sourcemap'] // test/index.js 由webpack 和 sourcemap预处理 
    },
    browsers: ['Chrome'],
    webpack: webpackConfig, // webpack的配置
    webpackMiddleware: {
      noInfo: true
    },
    autoWatch: true
  })
}