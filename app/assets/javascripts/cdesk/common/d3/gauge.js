(function() {
  "use strict";
  commonModule.service("gauge", function() {
    this.createGauge = function() {

    };
  })
}());

(function() {
  "use strict";
  commonModule.directive("gauge", function () {
    return {
      restrict: 'EAC',
      templateUrl: 'gauge'
    }
  })
}());