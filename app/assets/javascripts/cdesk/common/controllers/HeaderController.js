(function () {
  'use strict';
  commonModule.controller('headerController', function ($scope, loginModel) {
    $scope.user_name = loginModel.getUserName();
    $scope.showProfileMenu = function() {
      $("#profileDropdown").toggle();
      $("#brandsList").hide();
      $(".page_filters").find(".dropdown_open").removeClass("dropdown_open");
      $("#cdbDropdown").hide();
    }
  });
}());