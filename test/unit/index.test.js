// index.test.js
import test from 'src'
var expect = require('chai').expect;

describe('test的测试', function() {
  it('输出hello world', function() {
      console.log(test)
    expect(test()).to.be.equal('hello world');
  });
});