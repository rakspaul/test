(function () {
  'use strict';
  commonModule.controller('headerController', function ($scope, loginModel, $cookieStore, $location) {
    $scope.user_name = loginModel.getUserName();
    $scope.showProfileMenu = function() {
      $("#profileDropdown").toggle();
      $("#brandsList").hide();
      $(".page_filters").find(".dropdown_open").removeClass("dropdown_open");
      $("#cdbDropdown").hide();
    }

    $scope.logout = function() {
      console.log('logout');
      $cookieStore.remove('auth_token');
      $location.url('/login');
    };
  });
}());