module.exports =function(grunt) {
    'use strict';
    var config = {
        deploy : {
            files: [{
                expand: true,
                cwd: '<%= cvars.app %>/<%= cvars.appimage %>/',
                src: '{,*/}*.svg',
                dest: '<%= cvars.dist %>/<%= cvars.appimage %>/'
            }]
        }
    };

    grunt.config('svgmin', config);
}




