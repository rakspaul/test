(function () {
  'use strict';
  angObj.controller('BrandsListController', function ($scope) {

    $scope.$watch('selectedBrand.name', function (newName, oldName) {
      if (newName === oldName) {
        return;
      }
      applyBrandFilter();
    })
    function applyBrandFilter() {
      if ($scope.selectedBrand.name == undefined || $scope.selectedBrand.name.length < 1) {
        $scope.isExcludedByBrandFilter = false;
        return;
      }
      var filter = $scope.selectedBrand.name.toUpperCase();
      var value = $scope.brand.name.toUpperCase();
      if (value == $scope.ALL_BRANDS) {
        return;
      }
      var isSubString = (value.indexOf(filter) > -1);
      $scope.isExcludedByBrandFilter = !isSubString;
    }

  });
}());

