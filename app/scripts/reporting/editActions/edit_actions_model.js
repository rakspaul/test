define(['angularAMD'], function(angularAMD) { // jshint ignore:line
    'use strict';

    var editAction = function() {
        this.data = {
            id: 0,
            actionType: '',
            actionSubtype: '',
            tactic: '',
            metricImpacted: '',
            name: '',
            makeExternal: '',
            show: false
        };
    };

    angularAMD.service('editAction', editAction);
});
