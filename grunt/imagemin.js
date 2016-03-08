module.exports =function(grunt) {
    'use strict';
    var config = {
        deploy : {
            files: [{
                expand: true,
                cwd: '<%= cvars.app %>/<%= cvars.appimage %>/',
                src: '{,*/}*.{gif,jpeg,jpg,png}',
                dest: '<%= cvars.dist %>/<%= cvars.appimage %>/'
            }]
        }
    };

    grunt.config('imagemin', config);
}




