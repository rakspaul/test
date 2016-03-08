module.exports =function(grunt) {
    'use strict';

    var config = {
        deploy: {
            options: {
                preserveComments: 'some',
                sourceMapIncludeSources: true,
                sourceMap: true
            },
            files: [
                {
                    expand: true,
                    cwd: '<%= cvars.build %>/<%= cvars.appjs %>/',
                    dest: '<%= cvars.dist %>/<%= cvars.appjs %>/',
                    src: '**/*.js'
                }
            ]
        }
    };

    grunt.config('uglify', config);
}




