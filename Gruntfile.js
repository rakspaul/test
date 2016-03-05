// Gruntfile

module.exports = function (grunt) {
    'use strict';

    require('load-grunt-tasks')(grunt);

    var gruntConfig = grunt.file.readJSON('Gruntconfig.json');

    // Grunt Config
    grunt.initConfig({
        cvars: gruntConfig.configVars,
    });


    grunt.loadTasks('grunt');

    /**
     * setup task
     * Run the initial setup, sourcing all needed upstream dependencies
     */
    grunt.registerTask('setup', ['bower:setup', 'copy:setup']);


    /**
     * devel task
     * Launch webserver and watch for changes
     */
    grunt.registerTask('devel', [
        'connect:dev', 'watch', 'less:dev'
    ]);

    /**
     * build task
     * Use r.js to build the project
     */
    grunt.registerTask('build', [
        //'jshint:build',
        'clean:build',
        'preprocess:build',
        'htmlmin:build',
        'cssmin:build',
        'requirejs:build',
        'clean:post-requirejs',
        'copy:build'
    ]);


    /**
     * deploy task
     * Deploy to dist_www directory
     */
    grunt.registerTask('deploy', [
        'build',
        'clean:deploy',
        'htmlmin:deploy',
        'copy:deploy',
        //'uglify:deploy',
        'connect:server'
    ]);

    grunt.registerTask('hello', function () {
        grunt.log.write('hello task called with: ', gruntConfig);
    });

};
