module.exports =function(grunt) {
    'use strict';

    var config = {
        build: {
            files: {
                '<%= cvars.dist %>/<%= cvars.appcss %>/cdesk_application.min.css': [
                    '<%= cvars.app %>/<%= cvars.appcss %>/cdesk_application.css'
                ]
            }
        }
    };

    grunt.config('cssmin', config);
}




