module.exports =function(grunt) {
    'use strict';
    var config = {
        imagemin : {
            options: {
                optimizationLevel: 5
            },
            files: [{
                expand: true,
                cwd: '<%= cvars.app %>/<%= cvars.appimage %>/',
                src: ['**/*.{png,jpg,gif}'],
                dest: '<%= cvars.dist %>/<%= cvars.appimage %>/'
            }]
        }
    };

    grunt.config('imagemin', config);
}




