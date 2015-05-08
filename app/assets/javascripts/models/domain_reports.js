/*global angObj, angular*/
(function () {
    "use strict";
    angObj.factory("domainReports", [ function () {

        return {
            getReportsTabs : function() {
                return {
                    'tabs' : [
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
                    ],

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
                        $scope.perfReportDownloadBusy = true;
                        var report_url1 = report_url;
                        if (report_name === 'by_platforms')
                            report_url1 = report_url + '&start_date=' + $scope.selectedCampaign.startDate + '&end_date=' + $scope.selectedCampaign.endDate;
                        dataService.downloadFile(report_url1).then(function (response) {
                            if (response.status === "success") {
                                $scope.perfReportDownloadBusy = false;
                                saveAs(response.file, response.fileName);
                            } else {
                                $scope.perfReportDownloadBusy = false;
                            }
                        }, function() {
                            $scope.perfReportDownloadBusy = false;
                        }, function() {
                            $scope.perfReportDownloadBusy = false;
                        });
                        analytics.track(loginModel.getUserRole(), constants.GA_DOWNLOAD_REPORT, 'performance_' + report_name + '_report', loginModel.getLoginName());
                    }
                }
            }
        };
    });

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