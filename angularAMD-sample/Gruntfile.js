// Gruntfile
module.exports = function (grunt) {
    'use strict';

    require('load-grunt-tasks')(grunt);

    var modRewrite = require('connect-modrewrite');

    /**
     * Define Configuration Variables.
     * Note: cwd is './setup' so the `setup` variable defined below is only to be used
     *       when cwd has been changed to `app` and grunt needs to reference './setup'
     */
    var gruntConfig = grunt.file.readJSON('Gruntconfig.json');

    // Grunt Config
    grunt.initConfig({
        cvars: gruntConfig.configVars,

        bower: {
            setup: {
                options: {
                    install: true,
                    copy: false
                }
            }
        },

        copy: {
            setup: {
                files: [
                    // Javascript with standard .min.js naming convention
                    {
                        cwd: 'bower_components',
                        expand: true,
                        flatten: true,
                        dest: '<%= cvars.app %>/<%= cvars.appjs %>/libs/',
                        src: gruntConfig.bowerFiles
                    },

                    // CSS with standard .min.css naming convention
                    {
                        cwd: 'bower_components',
                        expand: true,
                        flatten: true,
                        dest: '<%= cvars.app %>/<%= cvars.appcss %>/libs/',
                        src: gruntConfig.cssFiles
                    },

                    // CSS Fonts
                    {
                        cwd: 'bower_components',
                        expand: true,
                        flatten: true,
                        dest: '<%= cvars.app %>/<%= cvars.appcss %>/fonts/',
                        src: gruntConfig.cssFonts
                    }
                ]
            },

            build: {
                files: [{
                    cwd: '<%= cvars.app %>/',
                    expand: true,
                    dest: '<%= cvars.build %>/',
                    src: gruntConfig.buildFiles
                }]
            },

            deploy: {
                files: [{
                    cwd: '<%= cvars.build %>/',
                    expand: true,
                    dest: '<%= cvars.dist %>/',
                    src: ['<%= cvars.appcss %>/**', 'images/**']
                }]
            }
        },

        // TODO: Optimize this task
        less: {
            setup: {
                options: {
                    cleancss: true
                },

                files: [{
                    expand: true,
                    cwd: '<%= cvars.app %>/<%= cvars.appcss %>/',
                    src: ['**/*.less'],
                    dest: '<%= cvars.app %>/<%= cvars.appcss %>/',
                    ext: '.css'
                }]
            },

            build: {
                options: {
                    compress: true,
                    cleancss: true,
                    optimization: 2,
                    sourceMap: true
                },

                files: [{
                    expand: true,
                    cwd: '<%= cvars.app %>/<%= cvars.appcss %>/',
                    src: ['**/*.less'],
                    dest: '<%= cvars.app %>/<%= cvars.appcss %>/',
                    ext: '.css'
                }]
            }
        },

        clean: {
            options: {
                force: true
            },

            build: ['<%= cvars.build %>'],
            'post-requirejs': ['<%= cvars.build %>/<%= cvars.appjs %>/libs'],
            deploy: ['<%= cvars.dist %>/*']
        },

        cssmin: {
            build: {
                files: {
                    '<%= cvars.build %>/<%= cvars.appcss %>/main.css': [
                        '<%= cvars.app %>/<%= cvars.appcss %>/libs/bootstrap.css',
                        '<%= cvars.app %>/<%= cvars.appcss %>/main.css'
                    ]
                }
            }
        },

        htmlmin: {
            // See https://github.com/yeoman/grunt-usemin/issues/44 for using 2 passes
            build: {
                options: {
                    removeComments: true,
                    // https://github.com/yeoman/grunt-usemin/issues/44
                    collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: true,
                    removeRedundantAttributes: true,
                    removeEmptyAttributes: true,
                    // Cannot remove empty elements with angular directives
                    removeEmptyElements: false
                },

                files: [
                    {
                        '<%= cvars.build %>/index.html': '<%= cvars.build %>/index.build.html'
                    },

                    {
                        cwd: '<%= cvars.app %>/views/',
                        expand: true,
                        flatten: false,
                        dest: '<%= cvars.build %>/views/',
                        src: ['*.html']
                    }
                ]
            },

            deploy: {
                options: {
                    collapseWhitespace: true
                },
                files: [
                    {
                        '<%= cvars.dist %>/index.html': '<%= cvars.build %>/index.html'
                    },

                    {
                        cwd: '<%= cvars.build %>/<%= cvars.appjs %>/main/templates/',
                        expand: true,
                        dest: '<%= cvars.dist %>/<%= cvars.appjs %>/main/templates/',
                        src: ['*.html']
                    },

                    {
                        cwd: '<%= cvars.build %>/views/',
                        expand: true,
                        dest: '<%= cvars.dist %>/views/',
                        src: ['**/*.html']
                    }
                ]
            }
        },

        requirejs: {
            build: {
                options: {
                    baseUrl: '<%= cvars.app %>/<%= cvars.appjs %>',
                    mainConfigFile: '<%= cvars.app %>/<%= cvars.appjs %>/main.js',
                    removeCombined: true,
                    findNestedDependencies: true,
                    optimize: 'none',
                    dir: '<%= cvars.build %>/<%= cvars.appjs %>/',

                    modules: [
                        {
                            name: 'app'
                        },

                        {
                            name: 'main/home_ctrl',
                            exclude: ['common']
                        },

                        {
                            name: 'rooms/rooms_ctrl',
                            exclude: ['common']
                        },

                        {
                            name: 'users/users_ctrl',
                            exclude: ['common']
                        }
                    ]
                }
            }
        },

        uglify: {
            deploy: {
                options: {
                    preserveComments: 'some',
                    sourceMapIncludeSources: true,
                    sourceMap: true
                },

                files: [{
                    cwd: '<%= cvars.build %>/<%= cvars.appjs %>/',
                    expand: true,
                    dest: '<%= cvars.dist %>/<%= cvars.appjs %>/',
                    src: '**/*.js'
                }]
            }
        },

        jshint: {
            build: {
                options: {
                    jshintrc: '.jshintrc'
                },

                files: {
                    src: [
                        '<%= cvars.app %>/<%= cvars.appjs %>/*.js',
                        '<%= cvars.app %>/<%= cvars.appjs %>/main/*.js',
                        '<%= cvars.app %>/<%= cvars.appjs %>/rooms/*.js',
                        '<%= cvars.app %>/<%= cvars.appjs %>/users/*.js'
                    ]
                }
            }
        },

        watch: {
            www: {
                files: ['<%= cvars.app %>/**/*'],
                tasks: ['less:setup'],

                options: {
                    spawn: false,
                    livereload: true
                }
            }
        },

        connect: {
            server: {
                livereload: true,

                options: {
                    port: gruntConfig.configVars.port,
                    hostname: gruntConfig.configVars.hostname,
                    base: '<%= cvars.app %>',

                    middleware: function(connect, options) {
                        var middlewares = [];

                        //Matches everything that does not contain a '.' (period)
                        middlewares.push(modRewrite(['^[^\\.]*$ /index.html [L]']));

                        options.base.forEach(function(base) {
                            middlewares.push(connect.static(base));
                        });

                        return middlewares;
                    }
                }
            }
        },

        preprocess: {
            dev: {
                options: {
                    context: { ENV: 'dev' }
                },

                src: '<%= cvars.app %>/index.master.html',
                dest: '<%= cvars.app %>/index.html'
            },

            qa: {
                options: {
                    context: { ENV: 'qa' }
                },

                src: '<%= cvars.app %>/index.master.html',
                dest: '<%= cvars.build %>/index.html'
            },

            beta: {
                options: {
                    context: { ENV: 'beta' }
                },

                src: '<%= cvars.app %>/index.master.html',
                dest: '<%= cvars.build %>/index.html'
            },

            production: {
                options: {
                    context: { ENV: 'production' }
                },

                src: '<%= cvars.app %>/index.master.html',
                dest: '<%= cvars.dist %>/index.html'
            }
        }
    });

    /**
     * setup task
     * Run the initial setup, sourcing all needed upstream dependencies
     */
    // TODO: Integrate this with the local dev machine 'build & watch' & 'devel' tasks? See below...
    grunt.registerTask('setup', ['bower:setup', 'copy:setup', 'less:setup']);

    /**
     * devel task
     * Launch webserver and watch for changes
     */
    // TODO: This task can be merged with the local dev machine 'build & watch' task. See below...
    grunt.registerTask('devel', [
        'connect:server', 'watch:www'
    ]);

    /**
     * build task
     * Use r.js to build the project
     */
    // TODO: Customize each build task lists
    // TODO: Look up how to use env plugin
    // REFERENCE: http://stackoverflow.com/questions/13800205/alternate-grunt-js-tasks-for-dev-prod-environments
    // 1. Local dev machine (TODO: This should be a 'build & watch', instead of a 'build'
    grunt.registerTask('build', [
        // htmlhint comes here
        // ng-annotate comes here (?)
        // js-beautifier comes here (also beautifies HTML, CSS & JSON apart from JS)
        'jshint:build',
        // jsonlint comes here
        // image-optimizer comes here (use contrib-imagemin?)
        // CSS auto-prefixer comes here
        'less:setup'
        // postcss comes here
        // csslint comes here
        // live-reload / browser-sync comes here
    ]);

    // 2. Dev box environment
    grunt.registerTask('build-dev', [
        'jshint:build',
        'clean:build',
        'preprocess:build',
        'htmlmin:build',
        'cssmin:build',
        'requirejs:build',
        'clean:post-requirejs',
        'copy:build',
        'preprocess:dev'
        // use contrib-compress?
    ]);

    // 3. QA box environment
    grunt.registerTask('build-qa', [
        'jshint:build',
        'clean:build',
        'preprocess:build',
        'htmlmin:build',
        'cssmin:build',
        'requirejs:build',
        'clean:post-requirejs',
        'copy:build',
        'preprocess:qa'
    ]);

    // 4. Beta box environment
    grunt.registerTask('build-beta', [
        'jshint:build',
        'clean:build',
        'preprocess:build',
        'htmlmin:build',
        'cssmin:build',
        'requirejs:build',
        'clean:post-requirejs',
        'copy:build',
        'preprocess:beta'
    ]);

    // 5. Production environment
    grunt.registerTask('build-production', [
        'jshint:build',
        'clean:build',
        'preprocess:build',
        'htmlmin:build',
        'cssmin:build',
        'requirejs:build',
        'clean:post-requirejs',
        'copy:build',
        'preprocess:production'
    ]);

    /**
     * deploy task
     * Deploy to dist_www directory
     */
    // TODO: This is basically the intended task for 'build-production'. Remove this & implement the tasks here in
    // TODO: 'build-production' given above.
    grunt.registerTask('deploy', [
        'build',
        'clean:deploy',
        'htmlmin:deploy',
        'copy:deploy',
        'uglify:deploy'
    ]);

    // TODO: This is a test / dummy task. Remove it or keep it?
    grunt.registerTask('hello', function() {
        grunt.log.write('hello task called with: ', gruntConfig);
    });

    /**
     * grunt-preprocess test
     */
    // TODO: These are temp tasks. Remove after the 'build-*' tasks are implemented
    grunt.registerTask('preprocess-default',
        ['preprocess:dev']
    );

    grunt.registerTask('preprocess-production',
        ['preprocess:production']
    );
};
