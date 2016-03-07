module.exports =function(grunt) {
    'use strict';

    var config = {
        build: {
            options: {
                baseUrl: '<%= cvars.app %>/<%= cvars.appjs %>',
                mainConfigFile: '<%= cvars.app %>/<%= cvars.appjs %>/main.js',
                removeCombined: true,
                findNestedDependencies: true,
                optimize: 'none',
                dir: '<%= cvars.build %>/<%= cvars.appjs %>/',
                modules: [
                    { name: 'app' }
                ]
            }
        }
    };

    grunt.config('requirejs', config);
}



