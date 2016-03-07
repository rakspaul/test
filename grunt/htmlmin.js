module.exports =function(grunt) {
    'use strict';
    var config = {
        // See https://github.com/yeoman/grunt-usemin/issues/44 for using 2 passes
        dist: {
            options: {
                collapseBooleanAttributes: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true,
                removeCommentsFromCDATA: true,
                removeEmptyAttributes: true,
                removeOptionalTags: true,
                removeRedundantAttributes: true,
                useShortDoctype: true
            },
            files: [{
                expand: true,
                cwd: '<%= cvars.dist %>',
                src: [
                    '{,*/}*.html',
                    'views/{,*/}*.*'
                ],
                dest: '<%= cvars.dist %>'
            }]
        }
    };

    grunt.config('htmlmin', config);
}
