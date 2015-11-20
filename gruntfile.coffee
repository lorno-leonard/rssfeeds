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
      vendor:
        src: [
          'bower_components/jquery/dist/jquery.min.js'
          'bower_components/bootstrap/dist/js/bootstrap.min.js'
          'bower_components/angular/angular.min.js'
          'bower_components/lodash/lodash.min.js'
        ]
        dest: 'public/js/vendor.js'
      css:
        src: [
          'bower_components/bootstrap/dist/css/bootstrap.min.css'
          'src/css/style.css'
        ]
        dest: 'public/css/app.css'
      angular:
        src: [
          'src/angular/app.js'
          'src/angular/**/*.js'
          'src/angular/run.js'
        ]
        dest: 'public/js/app.js'
    cssmin:
      options:
        keepSpecialComments: 0
      css:
        src: 'public/css/app.css'
        dest: 'public/css/app.css'
    copy:
      fonts:
        expand: true
        cwd: 'bower_components/bootstrap/fonts'
        src: ['*']
        dest: 'public/fonts'
      images:
        expand: true
        cwd: 'src/images'
        src: ['*']
        dest: 'public/images'
    uglify:
      options:
        mangle: false
        preserveComments: false
      vendor:
        files:
          'public/js/vendor.js': ['public/js/vendor.js']
      angular:
        files:
          'public/js/app.js': ['public/js/app.js']
    watch:
      templates:
        files: [
          'src/templates/template.prefix.html'
          'src/templates/html/*.html'
          'src/templates/template.suffix.html'
        ]
        tasks: ['templates']
      css:
        files: [
          'src/css/style.css'
        ]
        tasks: ['css']
      angular:
        files: [
          'src/angular/app.js'
          'src/**/*.js'
          'src/angular/run.js'
        ]
        tasks: ['angular']
      images:
        files: [
          'src/images/*'
        ]
        tasks: ['images']

  grunt.registerTask 'templates', ['concat:templates']
  grunt.registerTask 'css', ['concat:css', 'cssmin:css']
  grunt.registerTask 'vendor', ['concat:vendor', 'uglify:vendor']
  grunt.registerTask 'angular', ['concat:angular', 'uglify:angular']
  grunt.registerTask 'images', ['copy:images']
  grunt.registerTask 'dev', [
    'templates',
    'css',
    'vendor',
    'angular',
    'copy',
    'watch'
  ]
  grunt.registerTask 'default', ['dev']
