define(['angularAMD', 'reporting/models/activity_list'],function (angularAMD) {
    "use strict";
  var ActivityList = function() {
    this.data = {};
  }
  angularAMD.service('activityList', ActivityList);
});