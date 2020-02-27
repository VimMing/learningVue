import config from 'src/config' // webpack上面配置的别名, 被测试代码所在目录
const Utils = require('src/utils'), utils = Utils
import Vue from 'src'
var expect = require('chai').expect;  // 引入chai的expect
var assert = require('chai').assert;

describe('Utils', function () {
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
    describe('isObject', function () {

        it('should return correct result', function () {
            var iso = utils.isObject
            assert.ok(iso({}))
            assert.notOk(iso([]))
            assert.notOk(iso(1))
            assert.notOk(iso(true))
            assert.notOk(iso(null))
            assert.notOk(iso(undefined))
            assert.ok(iso(document.createElement('div')))
        })

    })
    describe('isTrueObject', function () {

        it('should return correct result', function () {
            var iso = utils.isTrueObject
            assert.ok(iso({}))
            assert.notOk(iso([]))
            assert.notOk(iso(1))
            assert.notOk(iso(true))
            assert.notOk(iso(null))
            assert.notOk(iso(undefined))
            assert.notOk(iso(document.createElement('div')))
        })

    })
    describe('guard', function () {

        it('should output empty string if value is null or undefined', function () {
            assert.strictEqual(utils.guard(undefined), '')
            assert.strictEqual(utils.guard(null), '')
        })

        it('should output stringified data if value is object', function () {
            assert.strictEqual(utils.guard({ a: 1 }), '{"a":1}')
            assert.strictEqual(utils.guard([1, 2, 3]), '[1,2,3]')
        })

    })
    describe('extend', function () {

        it('should extend the obj with extension obj', function () {
            var a = { a: 1 }, b = { a: {}, b: 2 }
            utils.extend(a, b)
            assert.strictEqual(a.a, b.a)
            assert.strictEqual(a.b, b.b)
        })

        it('should always return the extended object', function () {
            var a = { a: 1 }, b = { a: {}, b: 2 }
            assert.strictEqual(a, utils.extend(a, b))
            assert.strictEqual(a, utils.extend(a, undefined))
        })

    })
    describe('unique', function () {

        it('should filter an array with duplicates into unqiue ones', function () {
            var arr = [1, 2, 3, 1, 2, 3, 4, 5],
                res = utils.unique(arr),
                l = res.length
            assert.strictEqual(l, 5)
            while (--l) {
                assert.strictEqual(res[l], 5 - l)
            }
        })

    })
    describe('bind', function () {

        it('should bind the right context', function () {
            function test(v1, v2) {
                return this + 1
            }
            var bound = utils.bind(test, 2)
            assert.strictEqual(bound(), 3)
        })

    })
    describe('toConstructor', function () {

        it('should convert an non-VM object to a VM constructor', function () {
            var a = { test: 1 },
                A = utils.toConstructor(a)
            assert.ok(A.prototype instanceof Vue)
            // assert.strictEqual(A.options, a)
        })

        it('should return the argument if it is already a consutructor', function () {
            var A = utils.toConstructor(Vue)
            assert.strictEqual(A, Vue)
        })

    })

    describe('log', function () {

        if (!window.console) return

        it('should only log in debug mode', function () {
            // overwrite log temporarily
            var oldLog = console.log,
                logged
            console.log = function (msg) {
                logged = msg
            }

            utils.log('123')
            assert.notOk(logged)

            config.debug = true
            utils.log('123')
            assert.strictEqual(logged, '123')

            // teardown
            config.debug = false
            console.log = oldLog
        })

    })

    describe('warn', function () {

        if (!window.console) return

        it('should only warn when not in silent mode', function () {
            config.silent = true
            var oldWarn = console.warn,
                warned
            console.warn = function (msg) {
                warned = msg
            }

            utils.warn('123')
            assert.notOk(warned)

            config.silent = false
            utils.warn('123')
            assert.strictEqual(warned, '123')

            console.warn = oldWarn
        })

        it('should also trace in debug mode', function () {
            config.silent = false
            config.debug = true
            var oldTrace = console.trace,
                oldWarn = console.warn,
                traced
            console.warn = function () { }
            console.trace = function () {
                traced = true
            }

            utils.warn('testing trace')
            assert.ok(traced)

            config.silent = true
            config.debug = false
            console.trace = oldTrace
            console.warn = oldWarn
        })

    })

    describe('addClass', function () {

        var el = document.createElement('div')

        it('should work', function () {
            utils.addClass(el, 'hihi')
            assert.strictEqual(el.className, 'hihi')
            utils.addClass(el, 'hi')
            assert.strictEqual(el.className, 'hihi hi')
        })

        it('should not add duplicate', function () {
            utils.addClass(el, 'hi')
            assert.strictEqual(el.className, 'hihi hi')
        })

    })

    describe('removeClass', function () {

        it('should work', function () {
            var el = document.createElement('div')
            el.className = 'hihi hi ha'
            utils.removeClass(el, 'hi')
            assert.strictEqual(el.className, 'hihi ha')
            utils.removeClass(el, 'ha')
            assert.strictEqual(el.className, 'hihi')
        })

    })

    describe('checkNumber', function () {
        it('should work checkNumber', function () {
            assert.strictEqual(utils.checkNumber(123), 123)
            assert.strictEqual(utils.checkNumber('123'), 123)
            assert.strictEqual(utils.checkNumber(null), null)
            assert.strictEqual(utils.checkNumber(undefined), undefined)
            assert.strictEqual(utils.checkNumber('abc'), 'abc')
        })
    })

    describe('objectToArray', function () {
        var test = { a: 1 }
        it('should work objectToArray', function () {
            var val = utils.objectToArray(test)
            assert.strictEqual(val[0].$key, 'a')
            assert.strictEqual(val[0].$value, 1)
            let obj = {}
            test = {a: obj}
            val = utils.objectToArray(test)
            assert.strictEqual(val[0].$key, 'a')
            assert.strictEqual(val[0], obj)
        })
    })
});