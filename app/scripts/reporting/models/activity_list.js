define(['angularAMD', 'activity-list'], function (angularAMD) {
    'use strict';

    var ActivityList = function() {
        this.data = {};
    };

    angularAMD.service('activityList', ActivityList);
});
