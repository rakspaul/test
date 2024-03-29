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
                useStrict: true,
                findNestedDependencies: true,
                include: ['main'],
                dir: '<%= cvars.dist %>/<%= cvars.appjs %>/',
                modules: [
                    { name: 'app' }

                ],
                paths: {
                    populatetemplatecache: 'empty:'
                }
            }
        }
    };

    grunt.config('requirejs', config);
}



