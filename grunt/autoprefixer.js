module.exports =function(grunt) {
    'use strict';

    var config = {
        options: {
            browsers: ['last 1 version']
        },
        dist: {
            files: [{
                expand: true,
                cwd: '.tmp/styles/',
                src: '{,*/}*.css',
                dest: '.tmp/styles/'
            }]
        }
    };

    grunt.config('autoprefixer', config);
}
