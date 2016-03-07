module.exports =function(grunt) {
    'use strict';
    var gruntConfig = grunt.file.readJSON('Gruntconfig.json');
    var config = {
        setup: {
            files: [
                // Javascript with standard .min.js naming convention
                {
                    cwd: 'bower_components', expand: true, flatten: true,
                    dest: '<%= cvars.app %>/<%= cvars.appjs %>/libs/',
                    src: gruntConfig.bowerFiles
                },
                // CSS with standard .min.css naming convention
                //{
                //    cwd: 'bower_components', expand: true, flatten: true,
                //    dest: '<%= cvars.app %>/<%= cvars.appcss %>/libs/',
                //    src: gruntConfig.cssFiles
                //},
                // CSS Fonts
                {
                    cwd: 'bower_components', expand: true, flatten: true,
                    dest: '<%= cvars.app %>/fonts/',
                    src: gruntConfig.cssFonts
                }
            ]
        },
        dist: {
            files: [{
                expand: true,
                //dot: true,
                cwd: '<%= cvars.app %>',
                dest: '<%= cvars.dist %>',
                src: [
                    '*.{ico,png,txt}',
                    '.htaccess',
                    'images/{,*/}*.webp',
                    '{,*/}*.html',
                    'fonts/{,*/}*.*',
                    'views/**',
                    'conf/{,*/}*.*',
                    'scripts/**'

                ]
            }]
        },
        styles: {
            expand: true,
            dot: true,
            cwd: '<%= cvars.app %>/styles',
            dest: '<%= cvars.dist %>/styles/',
            src: ['**']
        }
    };
    grunt.config('copy', config);
}



