module.exports =function(grunt) {
    'use strict';

    var config = {
        options: {
            singleQuotes: true
        },
        dist: {
            files: [
                {
                    expand: true,
                    src: ['<%= cvars.dist %>/<%= cvars.appjs %>/**/*.js', '!**/*.annotated.js', '!<%= cvars.dist %>/<%= cvars.appjs %>/libs/*.js'],
                    ext: '.annotated.js',
                    extDot: 'last'
                }
            ]
        }
    };
    grunt.config('ngAnnotate', config);
}




