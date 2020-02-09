// index.test.js
import test from 'src' // webpack上面配置的别名, 被测试代码所在目录
var expect = require('chai').expect;  // 引入chai的expect

describe('test的测试', function() {
  it('输出hello world', function() {
    expect(test()).to.be.equal('hello world'); // 断言
  });
});