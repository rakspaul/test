define(['angularAMD','common/services/constants_service'],function (angularAMD) {
    'use strict';
    angularAMD.controller('BrandsListController', function (constants, $scope) {
    $scope.$watch('selectedBrand.name', function (newName, oldName) {
      if (newName === oldName) {
        return;
      }
      applyBrandFilter();
    });
    $scope.$watch('brandData.showAll', function (newBool, oldBool) {
      if (newBool === oldBool || newBool === false) {
        return;
      }
      applyBrandFilter();
    });
    function applyBrandFilter() {
      if ($scope.selectedBrand && ($scope.selectedBrand.name == undefined || $scope.selectedBrand.name.length < 1)) {
        $scope.isExcludedByBrandFilter = false;
        return;
      }
      var filter = $scope.selectedBrand.name.toUpperCase();
      var value = $scope.brand.name.toUpperCase();
      if (value == constants.ALL_BRANDS.toUpperCase()) {
        return;
      }
      var isSubString = (value.indexOf(filter) > -1);
      $scope.isExcludedByBrandFilter = !isSubString && ($scope.brandData.showAll === false);
    };
  });
}());