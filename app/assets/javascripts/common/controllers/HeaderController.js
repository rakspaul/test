(function () {
  'use strict';
    commonModule.controller('headerController', function ($scope, $rootScope, $http, loginModel, $cookieStore, $location) {

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
            $http.defaults.headers.common.Authorization = '';
            localStorage.clear();
            loginModel.deleteData();
        };

        $scope.logout = function() {
            $scope.removeUserData();
            $location.url('/login');
        };

        $rootScope.logout = $scope.logout; //setting logout function on $rootscope so that i can use the same function on app.js
        $rootScope.dashboard = {};
        $rootScope.dashboard.isNetworkUser = loginModel.getIsNetworkUser();

    });
}());
