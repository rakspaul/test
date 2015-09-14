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
                        href:'quality',
                        title: 'Quality'
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
            getCustomReportsTabs : function() {
                var tabs  =  [
                    {
                        href:'reports/list',
                        title: 'Collective Insights'
                    }
                ];
                return {
                    'tabs' :  tabs,
                     activeTab : document.location.pathname.substring(1)
                }
            },
            highlightHeaderMenu : function() {
                //Hot fix to show the campaign tab selected
                $(".main_navigation").find('.active').removeClass('active').end().find('#reports_nav_link').addClass('active');
            },
            highlightSubHeaderMenu: function() {
                $(".reports_sub_menu_dd").find('.active_tab').removeClass('active_tab').end().find('#'+document.location.pathname.substring(1)).addClass('active_tab');
            },


            checkForCampaignFormat :  function(adFormats) {
                var adSupportVideo = false;
                var adSupportDisplay = true;

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
                            adSupportDisplay = false;
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

            templateUrl: assets.html_report_header_tab,
            link: function(scope, element, attrs) {
                scope.textConstants = constants;
            }
        };
    }]);

    angObj.directive("addfilter", function($http, $compile) {
        return {
            restrict:'EAC',
            link: function($scope, element, attrs) {
                console.log(attrs);
                console.log(element);
                var template;
                element.bind('click', function() {
                    $http.get(assets.html_add_report_filter).then(function (tmpl) {
                        $scope.dimensionQuery ='';
                        template = $compile(tmpl.data)($scope);
                        angular.element(document.getElementById('filter_breakdown_row')).append(template);
                        $(".custom_filter_dropdown .dropdown-menu").find('input').on('click', function (e) {
                            e.stopPropagation();
                        });
                    });
                });
            },
            controller: function($scope, $cookieStore, $location){

            },
        };
    });

    angObj.directive("addmore", function($http, $compile) {
        return {
            restrict:'EAC',
            link: function($scope, element, attrs) {
                console.log(attrs);
                console.log(element);
                var template;
                element.bind('click', function() {
                    $http.get(assets.html_add_report_dimension).then(function (tmpl) {
                        template = $compile(tmpl.data)($scope);
                        angular.element(document.getElementById('breakdown_row')).append(template);
                    });
                });
            }
        };
    });

    angObj.directive('downloadReport', function ($http, $location, loginModel, dataService, apiPaths, constants, analytics) {
        return {
            controller: function($scope, $cookieStore, $location){

            },
            restrict:'EAC',
            templateUrl: assets.html_download_report,
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
            templateUrl: assets.html_screen_header,
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
            templateUrl: assets.html_daysofweek_header,
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
            templateUrl: assets.html_format_header,
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
            templateUrl: assets.html_performance_header,
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
            templateUrl: assets.html_cost_header,
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
            templateUrl: assets.html_viewablity_header,
            link: function(scope, element, attrs) {
                scope.textConstants = constants;
            }
        };
    }]);
    angObj.directive('filtersHeader', ['$http', '$compile','constants', function ($http, $compile,constants) {
        return {
            controller: function($scope, $cookieStore, $location){
            },
            restrict:'EAC',
            templateUrl: '/assets/html/partials/filters_header.html',
            link: function(scope, element, attrs) { 
                scope.reportFilter = attrs.reports ;
                scope.textConstants = constants;
            }
        };
    }]);
    angObj.directive('creativesHeader', ['$http', '$compile','constants', function ($http, $compile,constants) {
        return {
            controller: function($scope, $cookieStore, $location){
            },
            restrict:'EAC',
            templateUrl: assets.html_creatives_header,
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
            templateUrl: assets.html_adsizes_header,
            link: function(scope, element, attrs) {
                scope.textConstants = constants;
            }
        };
    }]);



}());