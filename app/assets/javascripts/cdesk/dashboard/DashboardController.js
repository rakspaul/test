(function () {
  "use strict";
  dashboardModule.controller('dashboardController', function ($scope, $rootScope, constants, dashboardModel, brandsModel) {
    $(".main_navigation").find('.active').removeClass('active').end().find('#dashboard_nav_link').addClass('active');
    $scope.data = dashboardModel.getData();

    $scope.clickOnBrandButton = function (e) {

      $rootScope.$broadcast(constants.BRAND_BUTTON_CLICKED);
      selectBrand(brandsModel.getBrand().allBrandObject);
    };
    function selectBrand(brand) {
      $rootScope.$broadcast(constants.EVENT_BRAND_CHANGED_FROM_DASHBOARD, brand);
    };
    $rootScope.$on(constants.BUBBLE_BRAND_CLICKED, function (event, args) {
      var brand = {id: args.brandId, name: args.className};
      selectBrand(brand);
    });
    updateTitle();

    $rootScope.$on(constants.EVENT_BRAND_CHANGED, function() {
      $rootScope.$broadcast(constants.BRAND_BUTTON_CLICKED);
      dashboardModel.setSelectedBrand(brandsModel.getSelectedBrand());
      updateTitle();
    });

    function updateTitle() {
      dashboardModel.setTitle();
    }

  })
}());