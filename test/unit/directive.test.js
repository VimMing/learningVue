
describe('Directive', function () {
    var assert = require('chai').assert;
    var Directive = require('src/directive')
    var Vue = require('src/index')
    var compiler = {
        options: {},
        getOption: function (type, id) {
            return Vue.options[type][id]
        },
        vm: {
            constructor: {}
        }
    }
    function makeSpy() {
        var spy = function () {
            spy.called++
            spy.args = [].slice.call(arguments)
        }
        spy.called = 0
        return spy
    }
    function build(name, exp, compiler) {
        var ast = Directive.parse(exp)[0]
        return new Directive(name, ast, directives[name], compiler, {})
    }

    describe('.parse', function () {

        it('key', function () {
            var res = Directive.parse('key')
            assert.equal(res.length, 1)
            assert.equal(res[0].key, 'key')
            assert.equal(res[0].expression, 'key')
        })
        it('arg:key', function () {
            var res = Directive.parse('arg:key')
            assert.equal(res.length, 1)
            assert.equal(res[0].key, 'key')
            assert.equal(res[0].arg, 'arg')
            assert.equal(res[0].expression, 'arg:key')
        })
        it('arg : key | abc de', function () {
            var res = Directive.parse('arg : key | abc de')
            assert.equal(res.length, 1)
            assert.equal(res[0].key, 'key')
            assert.equal(res[0].arg, 'arg')
            assert.equal(res[0].expression, 'arg : key | abc de')
            assert.equal(res[0].filters.length, 1)
            assert.equal(res[0].filters[0].args.length, 1)
            assert.equal(res[0].filters[0].args[0], 'de')
        })
        it('a || b | c', function () {
            var res = Directive.parse('a || b | c')
            assert.equal(res.length, 1)
            assert.equal(res[0].key, 'a || b')
            assert.equal(res[0].expression, 'a || b | c')
            assert.equal(res[0].filters.length, 1)
            assert.equal(res[0].filters[0].name, 'c')
            assert.notOk(res[0].filters[0].args)
        })
        it('a ? b : c', function () {
            var res = Directive.parse('a ? b : c')
            assert.equal(res.length, 1)
            assert.equal(res[0].key, 'a ? b : c')
            assert.notOk(res[0].filters)
        })
        it('"a:b:c||d|e|f" || d ? a : b', function () {
            var res = Directive.parse('"a:b:c||d|e|f" || d ? a : b')
            assert.equal(res.length, 1)
            assert.equal(res[0].key, '"a:b:c||d|e|f" || d ? a : b')
            assert.notOk(res[0].filters)
            assert.notOk(res[0].arg)
        })
        it('a, b, c', function () {
            var res = Directive.parse('a, b, c')
            assert.equal(res.length, 3)
            assert.equal(res[0].key, 'a')
            assert.equal(res[1].key, 'b')
            assert.equal(res[2].key, 'c')
        })
        it('a:b | c, d:e | f, g:h | i', function () {
            var res = Directive.parse('a:b | c, d:e | f, g:h | i')
            assert.equal(res.length, 3)

            assert.equal(res[0].arg, 'a')
            assert.equal(res[0].key, 'b')
            assert.equal(res[0].filters.length, 1)
            assert.equal(res[0].filters[0].name, 'c')
            assert.notOk(res[0].filters[0].args)

            assert.equal(res[1].arg, 'd')
            assert.equal(res[1].key, 'e')
            assert.equal(res[1].filters.length, 1)
            assert.equal(res[1].filters[0].name, 'f')
            assert.notOk(res[1].filters[0].args)

            assert.equal(res[2].arg, 'g')
            assert.equal(res[2].key, 'h')
            assert.equal(res[2].filters.length, 1)
            assert.equal(res[2].filters[0].name, 'i')
            assert.notOk(res[2].filters[0].args)
        })
        it('click:test(c.indexOf(d,f),"e,f"), input: d || [e,f], ok:{a:1,b:2}', function () {
            var res = Directive.parse('click:test(c.indexOf(d,f),"e,f"), input: d || [e,f], ok:{a:1,b:2}')
            assert.equal(res.length, 3)
            assert.equal(res[0].arg, 'click')
            assert.equal(res[0].key, 'test(c.indexOf(d,f),"e,f")')
            assert.equal(res[1].arg, 'input')
            assert.equal(res[1].key, 'd || [e,f]')
            assert.notOk(res[1].filters)
            assert.equal(res[2].arg, 'ok')
            assert.equal(res[2].key, '{a:1,b:2}')
        })
    })
})