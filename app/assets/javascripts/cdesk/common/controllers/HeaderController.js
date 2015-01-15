(function () {
  'use strict';
  commonModule.controller('headerController', function ($scope, loginModel, $cookieStore, $location, loginService) {
    $scope.user_name = loginModel.getUserName();
    $scope.showProfileMenu = function() {
      $("#profileDropdown").toggle();
      $("#brandsList").hide();
      $(".page_filters").find(".dropdown_open").removeClass("dropdown_open");
      $("#cdbDropdown").hide();
    }

    $scope.logout = function() {
      console.log('logout');
      loginService.logoutAction(function(response) {
        if(response.status == "success"){
          console.log('logout recorded on server');
        }
      }); 
      $cookieStore.remove('auth_token');
      localStorage.clear();
      $location.url('/login');

    };
  });
}());