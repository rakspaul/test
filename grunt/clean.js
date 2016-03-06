module.exports =function(grunt) {
    'use strict';

    var config = {
        options: {
            force: true
        },
        build: [
            '<%= cvars.build %>'
        ],
        'post-requirejs': [
            '<%= cvars.build %>/<%= cvars.appjs %>/libs'
        ],
        deploy: [
            '<%= cvars.dist %>/*'
        ]
    };

    grunt.config('clean', config);
}
