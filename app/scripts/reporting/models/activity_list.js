define(['angularAMD', 'reporting/models/activity_list'], function (angularAMD) { // jshint ignore:line
    'use strict';

    var ActivityList = function() {
        this.data = {};
    };

    angularAMD.service('activityList', ActivityList);
});
