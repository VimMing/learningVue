// 引入包
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.js', // 入口文件
  output: {
    filename: 'main.js', // 输出文件
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/, use: 'babel-loader', exclude: [
          path.resolve(__dirname, './test/unit/'),
          path.resolve(__dirname, './node_modules/')
        ]
      }
    ]
  },
};