module.exports =function(grunt) {
    'use strict';

    var config ={
        options: {
            base: '<%= cvars.app %>',
            module: 'visto.templates',
            singleModule: true,
            useStrict: true,
            quoteChar : '\'',
            amd : true,
            watch : true,
            rename : function(moduleName) {
                return '/' + moduleName;
            },
            htmlmin: {
                collapseBooleanAttributes: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true,
                removeComments: true,
                removeEmptyAttributes: true,
                removeRedundantAttributes: false, // don't change this
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true
            }
        },
        main: {
            src: ['<%= cvars.app %>/views/**/*.html'],
            dest: '<%= cvars.app %>/<%= cvars.appjs %>/populate_template_cache.js'
        }
    };

    grunt.config('html2js', config);
}
