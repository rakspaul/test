/***https://www.youtube.com/watch?v=e31elKr5hD0 ***/

module.exports =function(grunt) {
    'use strict';

    var config = {
        ngdocs: {
            all: ['src/resources/js/*.js']
        }
    };
    grunt.config('ngdocs', config);
}
