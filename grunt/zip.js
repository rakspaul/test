module.exports =function(grunt) {
    'use strict';
    var config = {
        'crpt-ui.zip': ['./**', '!*.zip']
    };

    grunt.config('zip', config);
}
