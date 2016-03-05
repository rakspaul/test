module.exports =function(grunt) {
    'use strict';

    var config = {
        setup: {
            options: { install: true, copy: false }
        }
    };

    grunt.config('bower', config);
}


