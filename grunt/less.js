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

        build: {
            options: {
                compress: true,
                cleancss: true,
                optimization: 2,
                sourceMap: true
            },

            files: [{
                expand: true,
                cwd: '<%= cvars.app %>/<%= cvars.appcss %>/',
                src: ['**/*.less'],
                dest: '<%= cvars.build %>/<%= cvars.appcss %>/',
                ext: '.css'
            }]
        }
    };

    grunt.config('less', config);
}





