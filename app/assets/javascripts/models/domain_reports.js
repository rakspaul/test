/*global angObj, angular*/
(function () {
    "use strict";
    angObj.factory("domainReports", ['loginModel', function (loginModel) {

        return {
            getReportsTabs : function() {
                var tabs  =  [
                    {
                        href:'performance',
                        title: 'Performance'
                    },
                    {
                        href:'cost',
                        title: 'Cost'
                    },
                    {
                        href:'platform',
                        title: 'Platform'
                    },
                    {
                        href:'inventory',
                        title: 'Inventory'
                    },
                    {
                        href:'viewability',
                        title: 'Viewability'
                    },
                    {
                        href:'optimization',
                        title: 'Optimization Impact'
                    }
                ];

                var isAgencyCostModelTransparent = loginModel.getIsAgencyCostModelTransparent();
                if(!isAgencyCostModelTransparent) { //if agency level cost model is opaque
                    tabs =  _.filter(tabs, function(obj, idx) {  return obj.href !== 'cost'});
                }

                return {
                    'tabs' :  tabs,
                     activeTab : document.location.pathname.substring(1)
                }
            },
            highlightHeaderMenu : function() {
                //Hot fix to show the campaign tab selected
                $(".main_navigation").find('.active').removeClass('active').end().find('#reports_nav_link').addClass('active');
            }
        };
    }]);

    angObj.directive('reportTabs', ['$http', '$compile', function ($http, $compile) {
        return {
            controller: function($scope, $cookieStore, $location){
            },
            restrict:'EAC',

            templateUrl: '/assets/html/partials/reports_header_tab.html',
            link: function(scope, element, attrs) {

            }
        };
    }]);

    angObj.directive('downloadReport', function ($http, loginModel, dataService, apiPaths, constants, analytics) {
        return {
            controller: function($scope, $cookieStore, $location){
            },
            restrict:'EAC',
            templateUrl: '/assets/html/partials/download_report.html',
            link: function($scope, element, attrs) {
                $scope.downloadPerformanceReport = function(report_url, report_name) {
                    if (!loginModel.cookieExists())
                        loginModel.checkCookieExpiry();
                    else {
                        $scope.reportDownloadBusy = true;
                        dataService.downloadFile(report_url).then(function (response) {
                            if (response.status === "success") {
                                $scope.reportDownloadBusy = false;
                                saveAs(response.file, response.fileName);
                            } else {
                                $scope.reportDownloadBusy = false;
                            }
                        }, function() {
                            $scope.reportDownloadBusy = false;
                        }, function() {
                            $scope.reportDownloadBusy = false;
                        });
                        analytics.track(loginModel.getUserRole(), constants.GA_DOWNLOAD_REPORT, 'performance_' + report_name + '_report', loginModel.getLoginName());
                    }
                }
            }
        };
    });

    angObj.directive('screenHeader', ['$http', '$compile', function ($http, $compile) {
        return {
            controller: function($scope, $cookieStore, $location){
            },
            restrict:'EAC',
            templateUrl: '/assets/html/partials/screen_header.html',
            link: function(scope, element, attrs) {

            }
        };
    }]);

    angObj.directive('daysofweekHeader', ['$http', '$compile', function ($http, $compile) {
        return {
            controller: function($scope, $cookieStore, $location){
            },
            restrict:'EAC',
            templateUrl: '/assets/html/partials/daysofweek_header.html',
            link: function(scope, element, attrs) {

            }
        };
    }]);

    angObj.directive('formatHeader', ['$http', '$compile', function ($http, $compile) {
        return {
            controller: function($scope, $cookieStore, $location){
            },
            restrict:'EAC',
            templateUrl: '/assets/html/partials/format_header.html',
            link: function(scope, element, attrs) {

            }
        };
    }]);


    angObj.directive('performanceHeader', ['$http', '$compile', function ($http, $compile) {
        return {
            controller: function($scope, $cookieStore, $location){
            },
            restrict:'EAC',
            templateUrl: '/assets/html/partials/performance_header.html',
            link: function(scope, element, attrs) {

            }
        };
    }]);

    angObj.directive('costHeader', ['$http', '$compile', function ($http, $compile) {
        return {
            controller: function($scope, $cookieStore, $location){
            },
            restrict:'EAC',
            templateUrl: '/assets/html/partials/cost_header.html',
            link: function(scope, element, attrs) {

            }
        };
    }]);

    angObj.directive('viewablityHeader', ['$http', '$compile', function ($http, $compile) {
        return {
            controller: function($scope, $cookieStore, $location){
            },
            restrict:'EAC',
            templateUrl: '/assets/html/partials/viewablity_header.html',
            link: function(scope, element, attrs) {

            }
        };
    }]);

}());