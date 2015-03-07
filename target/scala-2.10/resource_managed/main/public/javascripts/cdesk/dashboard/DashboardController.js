(function () {
  "use strict";
  dashboardModule.controller('dashboardController', function ($scope, $rootScope, constants, dashboardModel, brandsModel, loginModel, analytics) {
    $(".main_navigation").find('.active').removeClass('active').end().find('#dashboard_nav_link').addClass('active');
    $scope.data = dashboardModel.getData();

    $scope.clickOnBrandButton = function (e) {
      analytics.track(loginModel.getUserRole(), 'dashboard_bubble_widget', 'close_campaign_view', loginModel.getLoginName());
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
      dashboardModel.setSelectedBrand(brandsModel.getSelectedBrand());
      updateTitle();
    });

    function updateTitle() {
      dashboardModel.setTitle();
    }

  })
}());