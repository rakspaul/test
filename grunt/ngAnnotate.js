module.exports =function(grunt) {
    'use strict';

    var config = {
        ngAnnotate: {
            options: {
                singleQuotes: true
            },
            dist: {
                files: [
                    {
                        expand: true,
                        src: 'src/<%= pkg.name %>.js',
                        ext: '.annotated.js',
                        extDot: 'last'
                    }
                ]
            }
        },
    };
    grunt.config('ngAnnotate', config);
}




