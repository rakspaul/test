(function () {
  'use strict';
    commonModule.controller('headerController', function ($scope, $rootScope, $http, loginModel, $cookieStore, $location , domainReports ) {

        $scope.user_name = loginModel.getUserName();
        $scope.version = version;
        $scope.filters = domainReports.getReportsTabs();

        $scope.showProfileMenu = function() {
            $("#profileDropdown").toggle();
            $("#brandsList").hide();
            $(".page_filters").find(".filter_dropdown_open").removeClass("filter_dropdown_open");
            $("#cdbDropdown").hide();
        };

        $scope.NavigateToTab =  function(url, event) {
            $(".header_tab_dropdown").removeClass('active_tab')
            $(event.currentTarget).parent().addClass('active_tab');
            $location.url(url);
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

        $rootScope.dashboard = {};
        $rootScope.dashboard.isNetworkUser = loginModel.getIsNetworkUser();

    });
}());
