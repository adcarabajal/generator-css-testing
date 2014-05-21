'use strict';

module.exports = function( grunt ) {

  var path = require('path');
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    config: {
      serverPort: '<%=props.serverPort%>'
    },

    less: {
      release: {
        files: {
          'dist/css/bootstrap-custom.css': 'less/bootstrap-custom.less'
        },
        options: {
          paths: [
            path.resolve(__dirname, 'less'),
            path.resolve(__dirname, 'bower_components')],
          cleancss: true,
          strictUnits: true
        }
      }
    },

    connect: {
      testServer: {
        options: {
          port: '<%%=config.serverPort%>'
        }
      }
    },

    jshint: {
      all: ['Gruntfile.js', 'test/*-specs.js'],
      options: {jshintrc: '.jshintrc'}
    },

    mochaTest: {
      regression: {
        options: {
          timeout: 360000,
          reporter: 'spec'
        },
        src: ['test/*-specs.js']
      }
    }
  });


  grunt.registerTask('test-server', [
    'less:release',
    'connect:testServer'
  ]);

  grunt.registerTask('test', 'Executes test locally or on saucelabs' , function(env){
    process.env.TEST_ENVIRONMENTS = env || "local";

    grunt.task.run('less:release');
    grunt.task.run('connect:testServer');
    grunt.task.run('mochaTest:regression');
  });

};
