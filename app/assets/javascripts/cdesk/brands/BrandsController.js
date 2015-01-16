(function () {
  'use strict';
  brandsModule.controller('brandsController', function ($scope, brandsModel, utils, $rootScope, constants, loginModel, analytics) {

    brandsModel.getBrands(function (brandsData) {
      //data manipulation was already done in brandsModel, so just need to attach data to scope here
      $scope.brands = brandsData;
    });

    $scope.selectBrand = function (brand) {
      $('#brandsDropdown').attr('placeholder', brand.name);
      $('#brandsDropdown').val('');
      $scope.brandData.showAll = true;
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
      analytics.track(loginModel.getUserRole(), constants.GA_BRAND_SELECTED, brand.name);
    };

    $scope.brandsDropdownClicked = function() {
      $("#brandsList").toggle();
      $("#cdbMenu").closest(".each_filter").removeClass("filter_dropdown_open");
      $("#brandsList").closest(".each_filter").toggleClass("filter_dropdown_open");
      $("#cdbDropdown").hide();
      $("#profileDropdown").hide();
    };
    $scope.disableShowAll = function() {
      $scope.brandData.showAll = false;
    }
    $scope.highlightSearch = function (text, search) {
      return utils.highlightSearch(text, search);
    };
    $scope.brandData = brandsModel.getBrand();
  });
}());
