module.exports =function(grunt) {
    'use strict';

    var config = {
        dist: {
            files: {
                src: [
                    '<%= cvars.dist %>/scripts/{,*/}*.js',
                    '<%= cvars.dist %>/scripts/reporting/{,*/}*.js',
                    '<%= cvars.dist %>/scripts/workflow/{,*/}*.js',
                    '<%= cvars.dist %>/styles/{,*/}*.css',
                    '<%= cvars.dist %>/images/{,*/}*.{gif,jpeg,jpg,png,webp}',
                    '<%= cvars.dist %>/styles/fonts/{,*/}*.*'
                ]
            }
        }
    };

    grunt.config('rev', config);
}
