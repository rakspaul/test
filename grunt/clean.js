module.exports =function(grunt) {
    'use strict';

    var config = {
        dist: {
            files: [{
                dot: true,
                src: [
                    '.tmp',
                    '<%= cvars.dist %>/*',
                    '!<%= cvars.dist %>/.git*'
                ]
            }]
        },
        server: '.tmp'
    };

    grunt.config('clean', config);
}
