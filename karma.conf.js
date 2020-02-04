module.exports = function (config) {
    config.set({
      frameworks: ['mocha'],
  
      files: [
        'test/**/*.js'
      ],
  
      browsers: ['Chrome'],
  
      autoWatch: true
    })
  }