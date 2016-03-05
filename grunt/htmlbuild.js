module.exports =function(grunt) {
    'use strict';

    var config ={
        htmlbuild : {
            dist: {
                src: 'index.html',
                dest: '<%= cvars.dist %>/index.html',
                options: {
                    prefix: 'build/',
                    relative: true,
                    scripts: {
                        'package': ['<%= cvars.dist %>/<%= cvars.appjs %>/app.js']
                    },
                    styles: {
                        css: '<%= cvars.dist %>/<%= cvars.appcss %>/style.min.css'
                    }
                }

            }
        }
    };

    grunt.config('htmlbuild', config);
}





