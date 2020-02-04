// 引入包
const path = require('path');

module.exports = {
  mode: 'development',  
  entry: './src/index.js', // 入口文件
  output: {
    filename: 'main.js', // 输出文件
    path: path.resolve(__dirname, 'dist')
  }
};