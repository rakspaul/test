module.exports =function(grunt) {
    'use strict';

    var config = {
        build: {
            files: {
                '<%= cvars.build %>/<%= cvars.appcss %>/main.css': [
                    '<%= cvars.app %>/<%= cvars.appcss %>/libs/bootstrap.css',
                    '<%= cvars.app %>/<%= cvars.appcss %>/*.css'
                ]
            }
        }
    };

    grunt.config('cssmin', config);
}




