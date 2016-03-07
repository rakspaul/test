module.exports =function(grunt) {
    'use strict';
    var config = {
        compress: {
            options: {
                mode: 'zip',
                archive: '<%= cvars.production %>/crpt-ui.zip'
            },
            files: [
                {
                    expand: true,
                    cwd: '<%= cvars.app %>',
                    src: ['*']
                }
            ]
        }
    };

    grunt.config('compress', config);
}






