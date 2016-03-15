module.exports =function(grunt) {
    'use strict';

    var config = {
        dist: {
            options: {
                uglify2: {
                    compress: {
                        sequences: false,
                        global_defs: {
                            DEBUG: false
                        }
                    },
                    mangle: false
                },
                preserveLicenseComments: false,
                optimize: "uglify2",
                baseUrl: '<%= cvars.app %>/<%= cvars.appjs %>',
                mainConfigFile: '<%= cvars.app %>/<%= cvars.appjs %>/main.js',
                removeCombined: true,
                findNestedDependencies: true,
                dir: '<%= cvars.dist %>/<%= cvars.appjs %>/',
                modules: [
                    { name: 'app' }

                ]
            }
        }
    };

    grunt.config('requirejs', config);
}



