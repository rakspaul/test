module.exports =function(grunt) {
    'use strict';

    var config = {
        options: {
            dest: '<%= cvars.dist %>index.html'
        },
        html: '<%= cvars.app %>/index.master.html'
    };

    grunt.config('useminPrepare', config);
}
