(function () {
  'use strict';
  angObj.controller('BrandsController', function ($scope, dataService) {
    dataService.getBrands().then(function (response) {
      $scope.brands = response.data;
    });
  });
}());
