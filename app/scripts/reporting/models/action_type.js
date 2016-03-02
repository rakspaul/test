define(['angularAMD', 'reporting/models/action_type'],function (angularAMD) {
    "use strict";
  var ActionType = function () {
    this.id = 0;
    this.name = '';
    this.subTypes = [];
  }
  angularAMD.value('ActionType', ActionType);
});
