module.exports =function(grunt) {
    'use strict';

    var config = {
        dist: {
            options: {
                assets: ['<%= cvars.dist %>/**']
            },
            src: ['index.html']
        }
    };

    grunt.config('cacheBust', config);
}
