module.exports =function(grunt) {
    'use strict';

    var config = {
        files: ['<%= cvars.app %>/**/*'],
        tasks: [],
        options: {
            spawn: false,
            livereload: false
        }
    };

    grunt.config('watch', config);
}




