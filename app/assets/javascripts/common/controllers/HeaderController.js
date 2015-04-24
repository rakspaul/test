(function () {
  'use strict';
    commonModule.controller('headerController', function ($scope, $rootScope, loginModel, $cookieStore, $location, loginService, constants) {
        $scope.user_name = loginModel.getUserName();
        $scope.version = version;
        $scope.showProfileMenu = function() {
            $("#profileDropdown").toggle();
            $("#brandsList").hide();
            $(".page_filters").find(".filter_dropdown_open").removeClass("filter_dropdown_open");
            $("#cdbDropdown").hide();
        };
        $scope.removeUserData = function() {
            $cookieStore.remove('cdesk_session');
            localStorage.clear();
            loginModel.deleteData();
        };

        $scope.logout = function() {
            $scope.removeUserData();
            loginService.logoutAction(function(response) {
                if(response.status == "success"){
                    /*
                        //CRPT-2111
                        var locationPath =  $location.path();
                        $cookieStore.put(constants.COOKIE_REDIRECT, locationPath);
                    */
                    $location.url('/login');
                }
            });
        };
        $rootScope.dashboard = {};
        $rootScope.dashboard.isNetworkUser = loginModel.getIsNetworkUser();
    });
}());
