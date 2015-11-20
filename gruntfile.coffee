module.exports = (grunt)->
  require('load-grunt-tasks')(grunt)
  require('time-grunt')(grunt)

  grunt.initConfig
    concat:
      templates:
        src: [
          'src/templates/template.prefix.html'
          'src/templates/html/*.html'
          'src/templates/template.suffix.html'
        ]
        dest: 'public/index.html'
    watch:
      templates:
        files: [
          'src/templates/template.prefix.html'
          'src/templates/html/*.html'
          'src/templates/template.suffix.html'
        ]
        tasks: ['templates']

  grunt.registerTask 'templates', ['concat:templates']
  grunt.registerTask 'dev', ['concat:templates', 'watch']
