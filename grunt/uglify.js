module.exports =function(grunt) {
    'use strict';

    var config = {
        options: {
            preserveComments: 'some',
        },
        files: [
            {
                expand: true,
                cwd: '<%= cvars.dist %>/<%= cvars.appjs %>/',
                dest: '<%= cvars.dist %>/<%= cvars.appjs %>/',
                src: '**/*.js'
            }
        ]
    };

    grunt.config('uglify', config);
}




