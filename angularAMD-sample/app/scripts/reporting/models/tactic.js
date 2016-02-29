define(['angularAMD', 'reporting/models/tactiv'],function (angularAMD) {
    "use strict";
  var Tactic = function () {
    this.id = 0;
    this.name = '';
  }
  angularAMD.value('Tactic', Tactic);
});