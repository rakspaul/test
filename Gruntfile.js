// Gruntfile

module.exports = function (grunt) {
    'use strict';

    require('load-grunt-tasks')(grunt);

    require('time-grunt')(grunt);

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

    /**
     * build task
     * Use r.js to build the project
     */
    grunt.registerTask('build', [
        'clean:build',
        'copy:build',
        'preprocess:'+env
    ]);

    /**
     * deploy task
     * Deploy to dist_www directory
     */
    grunt.registerTask('deploy', [
        'build',
        'clean:deploy',
        'copy:deploy',
        'connect:server'
    ]);

    grunt.registerTask('hello', function () {
        grunt.log.write('hello task called with: ', gruntConfig);
    });

};
