module.exports =function(grunt) {
    'use strict';

    var config = {
        dist: {
            files: [{
                expand : true,
                cwd: '<%= cvars.app %>/views',
                src: '*',
                filter: 'isDirectory',
                dest: '<%= cvars.app %>/combined'
            }]
        }
    };

    grunt.config('angularCombine', config);
}


