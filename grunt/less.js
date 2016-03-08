module.exports =function(grunt) {
    'use strict';

    var config = {
        local: {
            options: {
                cleancss: true
            },
            files: [{
                expand: true,
                cwd: '<%= cvars.app %>/<%= cvars.appcss %>/',
                src: ['**/*.less'],
                dest: '<%= cvars.app %>/<%= cvars.appcss %>/',
                ext: '.css'
            }]
        },

        dist: {
            options: {
                compress: true,
                cleancss: true,
                optimization: 2,
            },

            files: [{
                expand: true,
                cwd: '<%= cvars.app %>/<%= cvars.appcss %>/',
                src: ['**/*.less'],
                dest: '<%= cvars.dist %>/<%= cvars.appcss %>/',
                ext: '.css'
            }]
        }
    };

    grunt.config('less', config);
}





