module.exports =function(grunt) {
    'use strict';
    var config = {
        build: {
            src : '<%= cvars.app %>/index.html',
            dest : '<%= cvars.build %>/index.build.html'
        }
    };

    grunt.config('preprocess', config);
}




