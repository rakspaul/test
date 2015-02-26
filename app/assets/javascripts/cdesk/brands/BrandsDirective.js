(function () {
  'use strict';
  brandsModule.directive('brandsDropDown', ['utils', function (utils) {
    return {
      restrict: 'EAC',
      templateUrl: 'brands_drop_down',
      link: function(scope, element, attrs) {
        $('.brandsList_ul').scrollWithInDiv();
      }
    };
  }]);

}());
