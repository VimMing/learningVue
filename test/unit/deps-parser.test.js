describe('Dependency Parser', function () {

    var DepsParser = require('src/deps-parser')
    var assert = require('chai').assert
    describe('.parse()', function () {

        // mock the bidnings...
        var bindings = [],
            catcher = DepsParser.catcher
        for (var i = 0; i < 10; i++) {
            mockBinding(i)
        }

        function mockBinding(i) {
            var b = {
                id: i,
                depId: ~~(Math.random() * i),
                deps: [],
                subs: [],
                compiler: {},
                value: {
                    $get: function () {
                        if (i > 0) {
                            catcher.emit('get', bindings[b.depId])
                        }
                    }
                }
            }
            bindings.push(b)
        }

        DepsParser.parse(bindings)

        it('should parse the deps correctly', function () {

            bindings.forEach(function (b) {
                if (b.id === 0) return
                var dep = b.deps[0]
                assert.strictEqual(dep.id, b.depId)
                assert.ok(dep.subs.indexOf(b) > -1)
            })

        })

    })

})