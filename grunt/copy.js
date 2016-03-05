module.exports =function(grunt) {
    'use strict';
    var gruntConfig = grunt.file.readJSON('Gruntconfig.json');
    var config = {
        setup: {
            files: [
                // Javascript with standard .min.js naming convention
                {
                    cwd: 'bower_components', expand: true, flatten: true,
                    dest: '<%= cvars.app %>/<%= cvars.appjs %>/libs/',
                    src: gruntConfig.bowerFiles
                },
                // CSS with standard .min.css naming convention
                {
                    cwd: 'bower_components', expand: true, flatten: true,
                    dest: '<%= cvars.app %>/<%= cvars.appcss %>/libs/',
                    src: gruntConfig.cssFiles
                },
                // CSS Fonts
                {
                    cwd: 'bower_components', expand: true, flatten: true,
                    dest: '<%= cvars.app %>/fonts/',
                    src: gruntConfig.cssFonts
                }
            ]
        },
        build: {
            files: [
                {
                    cwd: '<%= cvars.app %>/', expand: true,
                    dest: '<%= cvars.build %>/',
                    src: gruntConfig.buildFiles
                }
            ]
        },
        deploy: {
            files: [
                {
                    cwd: '<%= cvars.build %>/', expand: true,
                    dest: '<%= cvars.dist %>/',
                    src: ['<%= cvars.appcss %>/**', 'images/**', 'fonts/**', 'views/**']
                }
            ]
        }
    };
    grunt.config('copy', config);
}



