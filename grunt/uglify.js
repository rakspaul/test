module.exports =function(grunt) {
    'use strict';

    var config = {
        options: {
            preserveComments: 'some',
        },
        files: [
            {
                cwd: '<%= cvars.dist %>/<%= cvars.appjs %>/',
                expand: true,
                dest: '<%= cvars.dist %>/<%= cvars.appjs %>/',
                src: '**/*.js'
            }
        ]
    };

    grunt.config('uglify', config);
}




