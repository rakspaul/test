module.exports =function(grunt) {
    'use strict';

    var config = {
        options: {
            dest: '<%= cvars.dist %>'
        },
        html: '<%= cvars.app %>/{,*/}*.html'
    };

    grunt.config('useminPrepare', config);
}
