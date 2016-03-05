module.exports =function(grunt) {
    'use strict';

    var config = {
        build: {
            options: {
                jshintrc: '.jshintrc'
            },
            files: {
                src: [
                    '<%= cvars.app %>/<%= cvars.appjs %>/*.js'
                ]
            }
        }
    };
    grunt.config('jshint', config);
}
