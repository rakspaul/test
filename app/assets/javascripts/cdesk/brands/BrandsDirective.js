(function () {
  'use strict';
  brandsModule.directive('brandsDropDown', ['utils', function (utils) {
    return {
      restrict: 'EAC',
      templateUrl: '/assets/html/orders/_brands_drop_down.html',
      link: function(scope, element, attrs) {
        $('.brandsList_ul').scrollWithInDiv();
      }
    };
  }]);

}());
