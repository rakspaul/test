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
      if(brandsModel.getSelectedBrand().id === brand.id) {
        return;
      }
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

    $scope.brandsDropdownClicked = function() {
      $("#brandsList").toggle();
      $("#cdbMenu").closest(".each_filter").removeClass("dropdown_open");
      $("#brandsList").closest(".each_filter").toggleClass("dropdown_open");
      $("#cdbDropdown").hide();
      $("#profileDropdown").hide();
    };
    $scope.highlightSearch = function (text, search) {
      return utils.highlightSearch(text, search);
    };
    $scope.brand = brandsModel.getBrand();
  });
}());
