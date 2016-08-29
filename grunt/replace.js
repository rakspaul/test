module.exports =function(grunt) {
    'use strict';

    var config = {
        bust: {
            src: ['<%= cvars.dist %>/<%= cvars.appjs %>/main.js', '<%= cvars.dist %>/index.html'],
            overwrite: true,
            replacements: [
                {
                    from: '@@BUST@@',
                    to: '<%= new Date().getTime() %>'
                }
            ]
        }
    };

    grunt.config('replace', config);
}




