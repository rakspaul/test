define(['angularAMD','login/login_model','common/services/role_based_service','common/services/constants_service','reporting/timePeriod/time_period_directive'], function (angularAMD) {
  angularAMD.factory("domainReports", ['loginModel', 'RoleBasedService', function (loginModel, RoleBasedService) {

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

                var usrRole  = RoleBasedService.getClientRole() && RoleBasedService.getClientRole().ui_exclusions;
                if(usrRole && usrRole.ui_modules) {
                    tabs =  _.filter(tabs, function(obj, idx) {  return _.indexOf(usrRole.ui_modules, obj.href) == -1 });
                }


                return {
                    'tabs' :  tabs,
                     activeTab : document.location.pathname.substring(1)
                }
            },
            getCustomReportsTabs : function() {
                var tabs  =  [
                    {
                        href:'reports/schedules',
                        title: 'Scheduled'
                    },
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
                var adSupportDisplay = false;

                var videoAds =  function() {
                    return _.indexOf(adFormats, "VIDEO") != -1;
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

  angularAMD.directive('reportTabs', ['$http', '$compile','constants', function ($http, $compile,constants) {
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

  angularAMD.directive("addfilter", function($http, $compile) {
        return {
            restrict:'EAC',
            link: function($scope, element, attrs) {
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

  angularAMD.directive("addmore", function($http, $compile) {
        return {
            restrict:'EAC',
            link: function($scope, element, attrs) {
                var template;
                element.bind('click', function() {
                    $http.get(assets.html_add_report_dimension).then(function (tmpl) {
                        template = $compile(tmpl.data)($scope);
                        angular.element(document.getElementById('breakdown_row')).append(template);
                        if( $("#breakdown_row").find(".breakdown_div").length >= 0 ) {
                            $(".add_breakdown_btn").closest(".row").hide() ;
                        } else {
                            $(".add_breakdown_btn").closest(".row").show() ;
                        }
                    });
                });
            }
        };
    });

  angularAMD.directive("addfilterusers", function($http, $compile) {
        return {
            restrict:'EAC',
            link: function($scope, element, attrs) {
                var template;
                element.bind('click', function() {
                    $http.get(assets.html_add_filter_users).then(function (tmpl) {
                        template = $compile(tmpl.data)($scope);
                        angular.element(document.getElementById('filter-container')).append(template);

                    });
                });
            }
        };
    });

  angularAMD.directive('downloadReport', function ($http, $location, loginModel, advertiserModel, brandsModel, dataService, urlService, vistoconfig, constants) {
        return {
            controller: function($scope, $cookieStore, $location){

            },
            restrict:'EAC',
            templateUrl: assets.html_download_report,
            link: function($scope, element, attrs) {
                $scope.textConstants = constants;
                element.bind('click', function() {
                    var locationPath = $location.path();
                });
                $scope.downloadPerformanceReport = function(report) {
                    var queryObj = {
                        'url' : report.url,
                        queryId: report.query_id,
                        clientId: loginModel.getSelectedClient().id,
                        campaignId: $scope.selectedCampaign.id,
                        advertiserId : advertiserModel.getSelectedAdvertiser().id,
                        brandId : brandsModel.getSelectedBrand().id,
                        dateFilter: $scope.selected_filters.time_filter,
                        download_config_id : report.download_config_id
                    }

                    if(queryObj.queryId ===29 || queryObj.queryId === 16 || queryObj.queryId === 30 || queryObj.queryId === 31) {
                        //we need not do any thing since for these query id we need not to pass the ad group id.
                    } else {
                        queryObj['adGroupId'] = $scope.selectedStrategy.id;
                    }

                    var report_url = urlService.APIVistoCustomQuery(queryObj);
                    if(report.report_cat && report.report_type) {
                        report_url += "&report_cat=" + report.report_cat + "&report_type=" + report.report_type;
                        console.log("url", report_url);
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
                        analytics.track(loginModel.getUserRole(), constants.GA_DOWNLOAD_REPORT, 'performance_' + report.report_type + '_report', loginModel.getLoginName());
                    }
                }
            }
        };
    });

  angularAMD.directive('screenHeader', ['$http', '$compile','constants', function ($http, $compile,constants) { console.log('test');
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

  angularAMD.directive('daysofweekHeader', ['$http', '$compile','constants', function ($http, $compile,constants) {
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

  angularAMD.directive('formatHeader', ['$http', '$compile','constants', function ($http, $compile,constants) {
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


  angularAMD.directive('performanceHeader', ['$http', '$compile','constants', function ($http, $compile,constants) {
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

  angularAMD.directive('costHeader', ['$http', '$compile','constants', function ($http, $compile,constants) {
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

  angularAMD.directive('viewablityHeader', ['$http', '$compile','constants', function ($http, $compile,constants) {
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

  angularAMD.directive('marginHeader', ['$http', '$compile','constants', function ($http, $compile,constants) {
        return {
            controller: function($scope, $cookieStore, $location){
            },
            restrict:'EAC',
            templateUrl: assets.html_margin_header,
            link: function(scope, element, attrs) {
                scope.textConstants = constants;
            }
        };
    }]);

  angularAMD.directive('filtersHeader', ['$http', '$compile','constants', function ($http, $compile,constants) {
        return {
            controller: function($scope, $cookieStore, $location){
            },
            restrict:'EAC',
            templateUrl: assets.html_filters_header,
            link: function(scope, element, attrs) {
                scope.reportFilter = attrs.reports ;
                scope.textConstants = constants;
                scope.allCampaign = attrs.allCampaign;
                if(scope.allCampaign == "true" || scope.allCampaign == true) {
                    scope.selectedCampaign = { id: 0, name: 'All Media Plans', kpi: 'ctr', startDate: '-1', endDate: '-1'};
                }
            }
        };
    }]);
  angularAMD.directive('ngUpdateHiddenDropdown',function() {
        return function(scope, el, attr) {
            var model = attr['ngModel'];
            scope.$watch(model, function(nv) {
                el.val(nv);
                scope.permissions.push(nv);
            });

        };
    });

  angularAMD.directive('ngUpdateHiddenDays',function() {
        return function(scope, el, attr) {
            var model = attr['ngModel'];
            scope.$watch(model, function(nv) {
               if(nv) {


                   el.val(nv);
//                   scope.Schedule.dayPart[parseInt(attr.index)] = scope.Schedule.dayPart[parseInt(attr.index)] || {};
                   scope.selectedDays[attr.index] = el.val();
                   scope.Schedule.dayPart[parseInt(attr.index)][attr.field] = el.val();
               }
            });

        };
    });

  angularAMD.directive('clearrow',function() {
        return function(scope, el, attr) {
            $(el).click(function(){
                scope.Schedule.dayPart.splice(attr.index, 1);
                scope.Schedule.daytimeArr.splice(attr.index, 1);
                scope.Schedule.customLength -= 1;
                scope.changeDayTime();
                scope.$apply();
            })

        };
    });

  angularAMD.directive('ngUpdateHiddenDropdwn',function() {
        return function(scope, el, attr) {
            var model = attr['ngModel'];
            scope.$watch(model, function(nv) {
                el.val(nv);
                scope.allPermissions.push(nv);
            });

        };
    });

  angularAMD.directive('creativesHeader', ['$http', '$compile','constants', function ($http, $compile,constants) {
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

  angularAMD.directive('adsizesHeader', ['$http', '$compile','constants', function ($http, $compile,constants) {
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
});
