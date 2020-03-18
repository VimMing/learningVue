// require all test files
var testsContext = require.context('.', true, /observer.test$/)
testsContext.keys().forEach(testsContext)