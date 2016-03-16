module.exports =function(grunt) {
    'use strict';
    var config = {
        'dist' : {
            options: {
                mode: 'zip',
                archive: 'visto-ui.zip'
            },
            expand: true,
            cwd: './',
            src: ['dist/**', 'grunt/**', '*.json', 'package.json', 'scripts/**', 'Gruntfile.js'],
            dest: '/'
        }
    };

    grunt.config('compress', config);
}






