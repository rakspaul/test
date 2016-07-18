module.exports = function (grunt) {
    'use strict';

    var config = {
        build: {
            options: {
                jshintrc: '.jshintrc'
            },

            files: {
                src: [
                    '<%= cvars.app %>/<%= cvars.appjs %>/*.js',
                    '<%= cvars.app %>/<%= cvars.appjs %>/common/**/*.js',
                    '<%= cvars.app %>/<%= cvars.appjs %>/login/**/*.js',
                    '<%= cvars.app %>/<%= cvars.appjs %>/reporting/**/*.js',
                    '<%= cvars.app %>/<%= cvars.appjs %>/workflow/**/*.js'
                ]
            }
        }
    };

    grunt.config('jshint', config);
};
