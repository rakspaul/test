module.exports =function(grunt) {
    'use strict';

    var config = {
        dist: {
            options: {
                uglify2: {
                    mangle: false
                },
                optimize: "uglify2",
                baseUrl: '<%= cvars.app %>/<%= cvars.appjs %>',
                mainConfigFile: '<%= cvars.app %>/<%= cvars.appjs %>/main.js',
                removeCombined: true,
                findNestedDependencies: true,
                waitSeconds: 0,
                dir: '<%= cvars.dist %>/<%= cvars.appjs %>/',
                modules: [
                    { name: 'app' }

                ]
                //,optimizeCss: 'standard'
            }
        }
    };

    grunt.config('requirejs', config);
}



