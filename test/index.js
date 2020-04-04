// require all test files
var testsContext = require.context('.', true, /exp-parser.test$/)
testsContext.keys().forEach(testsContext)