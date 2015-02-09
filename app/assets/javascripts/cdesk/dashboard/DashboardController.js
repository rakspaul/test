(function () {
  "use strict";
  dashboardModule.controller('dashboardController', function ($scope, $rootScope, constants, dashboardModel) {
    $(".main_navigation").find('.active').removeClass('active').end().find('#dashboard_nav_link').addClass('active');
    $scope.data = dashboardModel.getData();

    $scope.clickOnBrandButton = function (e) {

      $rootScope.$broadcast(constants.BRAND_BUTTON_CLICKED);
      dashboardModel.setSelectedBrand(constants.ALL_BRANDS);
      updateTitle();
    };

    $rootScope.$on(constants.BUBBLE_BRAND_CLICKED, function (event, args) {
      dashboardModel.setSelectedBrand(args);
      updateTitle();
      $scope.$apply();
    });
    updateTitle();

    function updateTitle() {
      dashboardModel.setTitle();
    }

  })
}());