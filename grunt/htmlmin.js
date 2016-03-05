module.exports =function(grunt) {
    'use strict';
    var config = {
        // See https://github.com/yeoman/grunt-usemin/issues/44 for using 2 passes
        build: {
            options: {
                removeComments: true,
                collapseBooleanAttributes: true,
                removeAttributeQuotes: true,
                removeRedundantAttributes: true,
                removeEmptyAttributes: true,
                removeEmptyElements: false
            },
            files: [
                { '<%= cvars.build %>/index.html': '<%= cvars.build %>/index.build.html' },
                {
                    expand: true,
                    flatten: false,
                    cwd: '<%= cvars.app %>/views/',
                    dest: '<%= cvars.build %>/views/',
                    src: ['*.html']
                }
            ]
        },
        deploy: {
            files: [
                { '<%= cvars.dist %>/index.html': '<%= cvars.build %>/index.html' }
            ]
        }
    };

    grunt.config('htmlmin', config);
}
