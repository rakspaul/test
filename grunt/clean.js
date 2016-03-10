module.exports =function(grunt) {
    'use strict';

    var config = {
        dist: {
            files: [{
                dot: true,
                src: [
                    '<%= cvars.dist %>/*',
                    '!<%= cvars.dist %>/.git*'
                ]
            }]
        }
    };

    grunt.config('clean', config);
}
