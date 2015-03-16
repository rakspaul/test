(function () {
  'use strict';
  commonModule.controller('headerController', function ($scope, $rootScope, loginModel, $cookieStore, $location, loginService) {
    $scope.user_name = loginModel.getUserName();
    $scope.version = version;
    $scope.showProfileMenu = function() {
      $("#profileDropdown").toggle();
      $("#brandsList").hide();
      $(".page_filters").find(".filter_dropdown_open").removeClass("filter_dropdown_open");
      $("#cdbDropdown").hide();
    };

    $scope.logout = function() {
      loginService.logoutAction(function(response) {
        if(response.status == "success"){
        }
      });
      $cookieStore.remove('cdesk_session');
      localStorage.clear();
      loginModel.deleteData();
      $location.url('/login');

    };
    $rootScope.dashboard = {};
    $rootScope.dashboard.isNetworkUser = loginModel.getIsNetworkUser();
  });
}());
