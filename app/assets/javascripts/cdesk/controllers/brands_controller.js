(function () {
  'use strict';
  angObj.controller('BrandsController', function ($scope, dataService) {
    dataService.getBrands().then(function (response) {
      $scope.brands = [
        {'name': 'ALL BRANDS', 'id': -1, 'className': 'active'}
      ].concat(response.data);
      $scope.selectBrand = function (brand) {
        $('#brandsDropdown').attr('placeholder', brand.name);
        $('#brandsDropdown').val('');
        $scope.brands.forEach(function (entry) {
          if (brand.id == entry.id) {
            entry.className = 'active';
          } else {
            entry.className = '';
          }
        });
        $scope.campaigns.fetchAllCampaigns($scope.campaigns.timePeriod, brand.id);
      }
    });
  });
}());
