'use strict';

module.exports = function (grunt) {
  var reloadPort = 35729;
  require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);
  grunt.initConfig({
    develop: {
      server: {
	    file: 'server.js'
      }
    },
    connect: {
      options: {
	    port: 3000,
	    hostname: 'localhost'
      },
      dev: {
	    options: {
	      middleware: function (connect) {
	        return [
	          require('connect-livereload')(), // <--- here
	          checkForDownload,
	          mountFolder(connect, '.tmp'),
	          mountFolder(connect, 'app')
	        ];
	      }
	    }
      }
    },
    watch: {
      server: {
	    files: [
	      'server.js'
	    ],
	    tasks: ['develop'],
	    options: {
	      nospawn: true
	    }
      },
      sass: {
	    files: ['public/scss/*.{scss,sass}'],
	    tasks: ['compass']
      },
      css: {
        files: ['public/css/*.css'],
        options: {
          livereload: reloadPort
        }
      },
      js : {
        files: ['public/js/*.js','public/js/app/*.js'],
        options: {
          livereload: reloadPort
        }
      },
      html: {
        files: ['views/index.html','views/include/*.html'],
        options: {
          livereload: reloadPort
        }
      }
    },
    compass: {
      dist: {}
    }
  });

  grunt.registerTask('default', [
    'develop',
    'watch'
  ]);

};
