// require all test files
var testsContext = require.context('.', true, /deps-parser.test$/)
testsContext.keys().forEach(testsContext)