module.exports =function(grunt) {
    'use strict';

    var config = {
        // Performs rewrites based on rev and the useminPrepare configuration
        options: {
            assetsDirs: ['<%= cvars.dist %>']
        },
        html: ['<%= cvars.dist %>/{,*/}*.html'],
        css: ['<%= cvars.dist %>/styles/{,*/}*.css']
    };

    grunt.config('usemin', config);
}
