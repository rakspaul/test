module.exports =function(grunt) {
    'use strict';

    var config = {
        dist: {
            options: {
                baseUrl: '<%= cvars.app %>/<%= cvars.appjs %>',
                mainConfigFile: '<%= cvars.app %>/<%= cvars.appjs %>/main.js',
                removeCombined: true,
                findNestedDependencies: true,
                waitSeconds: 0,
                optimize: 'none',
                dir: '<%= cvars.dist %>/<%= cvars.appjs %>/',
                modules: [
                    { name: 'app' }
                ]
            }
        }
    };

    grunt.config('requirejs', config);
}



