import Utils from 'src/utils' // webpack上面配置的别名, 被测试代码所在目录
import alias from 'src/utils'
import Vue from 'src'
var expect = require('chai').expect;  // 引入chai的expect

describe('Utils', function () {
    // console.log(alias, Utils)
    console.log(alias === Utils)
    describe('normalizeKeypath', function () {
        it('shold work on brackets with quates', function () {
            expect(Utils.normalizeKeypath(`["a"]['b']["c"]`)).to.be.equal('.a.b.c')
        })
    })
    describe('get', function () {
        it('should get value', function () {
            var obj = { a: { b: { c: 123 } } }
            expect(Utils.get(obj, 'a.b.c')).to.be.equal(123)
        })
        it('should work on keypath with brackets', function () {
            var obj = { a: { b: { c: 123 } } }
            expect(Utils.get(obj, '["a"]["b"].c')).to.be.equal(123)
        })
        it('should return undefined if path does not exist', function () {
            var obj = { a: {} }
            expect(Utils.get(obj, 'a.b'), void 0)
        })
    })
    describe('set', function () {
        it('should set value', function () {
            var obj = {}
            Utils.set(obj, 'a.b.c', 123)
            expect(obj.a.b.c).to.be.equal(123)
        })
        it('should work on keypath with brackets', function () {
            var obj = {}
            Utils.set(obj, `["a"]['b'].c`, 123)
            expect(obj.a.b.c).to.be.equal(123)
        })
    })
    describe('hash', function () {
        it('should return Object with null prototype', function () {
            var hash = Utils.hash()
            expect(Object.getPrototypeOf(hash)).to.be.equal(null)
        })
    })
    describe('attr', function () {
        // 先创建测试元素
        var el = document.createElement('div')
        el.setAttribute('v-model', 'test')
        it('should append the prefix and return the attribute value', function () {
            var val = Utils.attr(el, 'model')
            expect(val).to.be.equal('test')
        })
        it('should remove attribute', function () {
            expect(el.hasAttribute('v-model')).to.not.be.ok;
        })
        it('should work with different prefix', function () {
            Vue.config({ prefix: 't' })
            el.setAttribute('t-model', 'test')
            expect(Utils.attr(el, 'model')).to.be.equal('test')
            expect(el.hasAttribute('t-model')).to.not.be.ok;
            Vue.config({ prefix: 'v' })
        })
    })
    describe('defProtected', function () {
        it('should define protected property', function () {
            var a = {}
            Utils.defProtected(a, 'test', 1)
            var keys = []
            for (let key in a) {
                keys.push(key)
            }
            expect(keys.length, 'ienumerable').to.be.equal(0)
            expect(JSON.stringify(a), 'unstringifiable').to.be.equal('{}')
            try {
                a.test = 2
            } catch (e) {
            }
            expect(a.test).to.be.equal(1)
        })
        it('should be enumerable and writable', function () {
            var a = {}
            Utils.defProtected(a, 'test', 1, true, true)
            var keys = []
            for (let key in a) {
                keys.push(key)
            }
            expect(keys.length, 'enumerable').to.be.equal(1)
            expect(JSON.stringify(a), 'stringifiable').to.be.equal('{"test":1}')
            a.test = 2
            expect(a.test).to.be.equal(2)
        })
    })
});