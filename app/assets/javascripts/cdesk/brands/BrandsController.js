(function () {
  'use strict';
  brandsModule.controller('brandsController', function ($scope, brandsModel, utils, $rootScope, constants) {

    brandsModel.getBrands(function (brandsData) {
      //data manipulation was already done in brandsModel, so just need to attach data to scope here
      $scope.brands = brandsData;
    });

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
      brandsModel.setSelectedBrand(brand);
      $rootScope.$broadcast(constants.EVENT_BRAND_CHANGED, brand);
    };

    $scope.highlightSearch = function (text, search) {
      return utils.highlightSearch(text, search);
    };
  });
}());
