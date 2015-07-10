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
            },

            checkForCampaignFormat :  function(adFormats) {
                var adSupportVideo = false;
                var adSupportDisplay = false;

                var videoAds =  function() {
                    return _.indexOf(adFormats, 'Video') != -1;
                }
                if(adFormats && adFormats.length >0) {
                    if (videoAds() && adFormats.length > 1) {
                        adSupportVideo = true;
                        adSupportDisplay = true;
                    } else {
                        if (videoAds() && adFormats.length === 1) {
                            adSupportVideo = true;
                        } else {
                            adSupportDisplay = true;
                        }
                    }
                }

                return {'videoAds' : adSupportVideo, 'displayAds': adSupportDisplay}
            }

        };
    }]);

    angObj.directive('reportTabs', ['$http', '$compile','constants', function ($http, $compile,constants) {
        return {
            controller: function($scope, $cookieStore, $location){
            },
            restrict:'EAC',

            templateUrl: '/assets/html/partials/reports_header_tab.html',
            link: function(scope, element, attrs) {
                scope.textConstants = constants;
            }
        };
    }]);

    angObj.directive('downloadReport', function ($http, $location, loginModel, dataService, apiPaths, constants, analytics) {
        return {
            controller: function($scope, $cookieStore, $location){

            },
            restrict:'EAC',
            templateUrl: '/assets/html/partials/download_report.html',
            link: function($scope, element, attrs) {
                $scope.textConstants = constants;
                element.bind('click', function() {
                    var locationPath = $location.path();
                    if(loginModel.getIsAgencyCostModelTransparent()) {
                        if(!$scope.isCostModelTransparent) {
                            element.find("li.report_cost").addClass("download_anchor_li_disabled");
                        }
                    }
                });
                $scope.downloadPerformanceReport = function(report_url, report_name) {
                    if(loginModel.getIsAgencyCostModelTransparent()) {
                        if (!$scope.isCostModelTransparent && report_url.indexOf(/cost/) > 0) {
                            return false;
                        }
                    }

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

    angObj.directive('screenHeader', ['$http', '$compile','constants', function ($http, $compile,constants) {
        return {
            controller: function($scope, $cookieStore, $location){
            },
            restrict:'EAC',
            templateUrl: '/assets/html/partials/screen_header.html',
            link: function(scope, element, attrs) {
                scope.textConstants = constants;
            }
        };
    }]);

    angObj.directive('daysofweekHeader', ['$http', '$compile','constants', function ($http, $compile,constants) {
        return {
            controller: function($scope, $cookieStore, $location){
            },
            restrict:'EAC',
            templateUrl: '/assets/html/partials/daysofweek_header.html',
            link: function(scope, element, attrs) {
                scope.textConstants = constants;
            }
        };
    }]);

    angObj.directive('formatHeader', ['$http', '$compile','constants', function ($http, $compile,constants) {
        return {
            controller: function($scope, $cookieStore, $location){
            },
            restrict:'EAC',
            templateUrl: '/assets/html/partials/format_header.html',
            link: function(scope, element, attrs) {
                scope.textConstants = constants;
            }
        };
    }]);


    angObj.directive('performanceHeader', ['$http', '$compile','constants', function ($http, $compile,constants) {
        return {
            controller: function($scope, $cookieStore, $location){
            },
            restrict:'EAC',
            templateUrl: '/assets/html/partials/performance_header.html',
            link: function(scope, element, attrs) {
                scope.textConstants = constants;
            }
        };
    }]);

    angObj.directive('costHeader', ['$http', '$compile','constants', function ($http, $compile,constants) {
        return {
            controller: function($scope, $cookieStore, $location){
            },
            restrict:'EAC',
            templateUrl: '/assets/html/partials/cost_header.html',
            link: function(scope, element, attrs) {
                scope.textConstants = constants;
            }
        };
    }]);

    angObj.directive('viewablityHeader', ['$http', '$compile','constants', function ($http, $compile,constants) {
        return {
            controller: function($scope, $cookieStore, $location){
            },
            restrict:'EAC',
            templateUrl: '/assets/html/partials/viewablity_header.html',
            link: function(scope, element, attrs) {
                scope.textConstants = constants;
            }
        };
    }]);

    angObj.directive('creativesHeader', ['$http', '$compile','constants', function ($http, $compile,constants) {
        return {
            controller: function($scope, $cookieStore, $location){
            },
            restrict:'EAC',
            templateUrl: '/assets/html/partials/creatives_header.html',
            link: function(scope, element, attrs) {
                scope.textConstants = constants;
            }
        };
    }]);

    angObj.directive('adsizesHeader', ['$http', '$compile','constants', function ($http, $compile,constants) {
        return {
            controller: function($scope, $cookieStore, $location){
            },
            restrict:'EAC',
            templateUrl: '/assets/html/partials/adsizes_header.html',
            link: function(scope, element, attrs) {
                scope.textConstants = constants;
            }
        };
    }]);



}());