(function() {
  "use strict";
  dashboardModule.controller('dashboardController', function ($scope,$rootScope, constants) {
      $(".main_navigation").find('.active').removeClass('active').end().find('#dashboard_nav_link').addClass('active');
      $scope.init = function(){
          $scope.selectedBrand = {} ;
          $scope.brandSelected = false
      };

      $scope.init();

      $scope.clickOnBrandButton = function(e){

          $rootScope.$broadcast(constants.BRAND_BUTTON_CLICKED);
          $("#brandButton").hide();
      };

      $scope.$on(constants.BUBBLE_BRAND_CLICKED, function(event, args) {
          $scope.selectedBrand = args ;
          $scope.brandSelected = true;
          $scope.$apply();
          $("#brandButton").show();
        // alert("catch the event in dashboard");
      });
  })
}());