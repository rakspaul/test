(function () {
  'use strict';
  brandsModule.directive('brandsDropDown', ['utils', function (utils) {
    return {
      restrict: 'EAC',
      templateUrl: assets.html_brands_drop_down,
      link: function(scope, element, attrs) {
        $('.brandsList_ul').scrollWithInDiv();
      }
    };
  }]);

}());