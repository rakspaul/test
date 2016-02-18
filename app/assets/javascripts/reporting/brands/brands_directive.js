(function () {
  'use strict';
  brandsModule.directive('brandsDropDown', function () {
    return {
      restrict: 'EAC',
      templateUrl: assets.html_brands_drop_down,
      link: function(scope, element, attrs) {
        $('.brandsList_ul').scrollWithInDiv();
      }
    };
  });

}());