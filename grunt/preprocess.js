module.exports =function(grunt) {
    'use strict';
    var config = {
        local : {
            options: {
                context: { ENV: 'local' }
            },
            src: '<%= cvars.app %>/index.master.html',
            dest: '<%= cvars.app %>/index.html'
        },
        dev: {
            options: {
                context: { ENV: 'dev' }
            },
            src: '<%= cvars.app %>/index.master.html',
            dest: '<%= cvars.dist %>/index.html'
        },

        qa: {
            options: {
                context: { ENV: 'qa' }
            },

            src: '<%= cvars.app %>/index.master.html',
            dest: '<%= cvars.dist %>/index.html'
        },

        beta: {
            options: {
                context: { ENV: 'beta' }
            },

            src: '<%= cvars.app %>/index.master.html',
            dest: '<%= cvars.dist %>/index.html'
        },

        prod: {
            options: {
                context: { ENV: 'production' }
            },

            src: '<%= cvars.app %>/index.master.html',
            dest: '<%= cvars.dist %>/index.html'
        }
    };

    grunt.config('preprocess', config);
}




