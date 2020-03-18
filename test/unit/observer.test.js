var assert = require('chai').assert;
var Observer = require('src/observer');
var Emitter = require('src/emitter')

function setTestFactory(opts) {
    return function () {
        var ob = new Emitter(),
            i = 0,
            obj = opts.obj,
            expects = opts.expects
        Observer.observe(obj, opts.path, ob)
        ob.on('set', function (key, val) {
            var expect = expects[i]
            assert.strictEqual(key, expect.key)
            assert.strictEqual(val, expect.val)
            i++
        })
        expects.forEach(function (expect) {
            if (expect.skip) return
            var path = expect.key.split('.'),
                j = 1,
                data = obj
            while (j < path.length - 1) {
                data = data[path[j]]
                j++
            }
            data[path[j]] = expect.val
        })
        assert.strictEqual(i, expects.length)
    }
}

describe('Observer', function () {
    describe('Observing Object', function () {
        // it('should not watch a ViewModel instance', function () {
        //     var obj = new Vue(), ob = new Emitter()
        //     Observer.observe(obj, 'test', ob)
        //     assert.notOk(obj.__emitter__)
        // })
        it('should attach hidden observer and values to the object', function () {
            var obj = {}, ob = new Emitter()
            Observer.observe(obj, 'test', ob)
            assert.ok(obj.__emitter__ instanceof Emitter)
            assert.ok(obj.__emitter__.values)
        })
        var o1 = { a: 1, b: { c: 2 } }
        it('should emit set events with correct path', setTestFactory({
            obj: o1,
            expects: [
                { key: 'test.a', val: 1 },
                { key: 'test', val: o1, skip: true },
                { key: 'test.b.c', val: 3 },
                { key: 'test.b', val: o1.b, skip: true },
                { key: 'test', val: o1, skip: true }
            ],
            path: 'test'
        }))
        var o2 = { a: 1, b: { c: 2 } }
        // 看observe的代码可以知道， observe在初始化的时候，会触发一次set事件，
        // 当设置nested object的时候， 相当与重新observe这个 nested objct, 即下面的test.b.c
        it('should emit multiple events when a nested object is set', setTestFactory({
            obj: o2,
            expects: [
                { key: 'test.b', val: { c: 3 } },
                { key: 'test', val: o2, skip: true },
                { key: 'test.b.c', val: 3, skip: true }
            ],
            path: 'test'
        }))
        it('should emit get events', function () {
            Observer.shouldGet = true

            var ob = new Emitter(),
                i  = 0,
                obj = { a: 1, b: { c: 2 } },
                gets = [
                    'a',
                    'b.c'
                ],
                expects = [
                    'test.a',
                    'test.b',
                    'test.b.c'
                ]
            Observer.observe(obj, 'test', ob)
            ob.on('get', function (key) {
                var expected = expects[i]
                assert.strictEqual(key, expected)
                i++
            })
            gets.forEach(function (key) {
                var path = key.split('.'),
                    j = 0,
                    data = obj
                while (j < path.length) {
                    data = data[path[j]]
                    j++
                }
            })
            assert.strictEqual(i, expects.length)

            Observer.shouldGet = false
        })
        it('should emit set when first observing', function () {
            var obj = { a: 1, b: { c: 2} },
                ob = new Emitter(), i = 0
            var expects = [
                { key: 'test.a', val: obj.a },
                { key: 'test.b', val: obj.b },
                { key: 'test.b.c', val: obj.b.c }
            ]
            ob.on('set', function (key, val) {
                var exp = expects[i]
                assert.strictEqual(key, exp.key)
                assert.strictEqual(val, exp.val)
                i++
            })
            Observer.observe(obj, 'test', ob)
            assert.strictEqual(i, expects.length)
        })
        it('should emit set when watching an already observed object', function () {
            var obj = { a: 1, b: { c: 2} },
                ob1 = new Emitter(),
                ob2 = new Emitter(),
                i = 0
            Observer.observe(obj, 'test', ob1) // watch first time

            var expects = [
                { key: 'test.a', val: obj.a },
                { key: 'test.b', val: obj.b },
                { key: 'test.b.c', val: obj.b.c }
            ]
            ob2.on('set', function (key, val) {
                var exp = expects[i]
                assert.strictEqual(key, exp.key)
                assert.strictEqual(val, exp.val)
                i++
            })
            Observer.observe(obj, 'test', ob2) // watch again
            assert.strictEqual(i, expects.length)
        })
    })
})