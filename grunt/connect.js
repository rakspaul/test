module.exports =function(grunt) {
    'use strict';
    var gruntConfig = grunt.file.readJSON('Gruntconfig.json');
    var modRewrite = require('connect-modrewrite');
    var config = {
        local: {
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
        },
        server: {
            options: {
                port: gruntConfig.configVars.port,
                hostname: gruntConfig.configVars.hostname,
                base: '<%= cvars.dist %>',
                keepalive :true,
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
  };

    grunt.config('connect', config);
}





