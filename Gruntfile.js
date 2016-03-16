// Gruntfile

module.exports = function (grunt) {
    'use strict';

    require('load-grunt-tasks')(grunt);

    require('time-grunt')(grunt);

    var gruntConfig = grunt.file.readJSON('Gruntconfig.json');


    // Grunt Config
    grunt.initConfig({
        cvars: gruntConfig.configVars,

        concurrent: {
            dist: [
                'less:dist',
                'copy:styles',
                'imagemin',
                'svgmin',
                'cssmin'
            ]
        }
    });

    grunt.loadTasks('grunt');


    /**
     * setup task
     * Run the initial setup, sourcing all needed upstream dependencies
     */
    grunt.registerTask('setup', ['bower:setup', 'copy:setup']);

    var env = grunt.option('target') || 'local';

    /**
     * devel task
     * Launch webserver and watch for changes
     */
    grunt.registerTask('devel', [
        'less:local',
        'preprocess:local',
        'connect:local',
        'watch'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        //'useminPrepare',
        'concurrent:dist',
        'autoprefixer',
        'copy:dist',
        //'rev',
        //'usemin',
        'ngAnnotate',
        'requirejs',
        'preprocess:'+env,
        'htmlmin',
        'compress'
    ]);

    grunt.registerTask('start', [
       'connect:server'
    ]);


    grunt.registerTask('compressFile', [
        'compress'
    ]);
};
