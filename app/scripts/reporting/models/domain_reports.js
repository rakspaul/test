define(['angularAMD', 'login/login_model', 'common/services/role_based_service',
    'common/services/features_service', 'common/services/vistoconfig_service',
    'reporting/timePeriod/time_period_directive', 'reporting/subAccount/sub_account_directive',
    'common/services/account_service'], function (angularAMD) {
    'use strict';

    angularAMD.factory('domainReports', function ($location, loginModel, RoleBasedService, featuresService) {
            return {
                getReportsTabs: function (params) {
                    var tabs = [],
                        fParams = params || featuresService.getFeatureParams(),
                        isAgencyCostModelTransparent,
                        userRole;

                    if (fParams[0].report_overview === true) {
                        tabs.push({href: 'overview', title: 'Reports Overview'});
                    }

                    if (fParams[0].performance === true) {
                        tabs.push({href: 'performance', title: 'Performance'});
                    }

                    if (fParams[0].cost === true) {
                        tabs.push({href: 'cost', title: 'Cost'});
                    }

                    if (fParams[0].platform === true) {
                        tabs.push({href: 'platform', title: 'Platform'});
                    }

                    if (fParams[0].inventory === true) {
                        tabs.push({href: 'inventory', title: 'inventory'});
                    }

                    if (fParams[0].quality === true) {
                        tabs.push({href: 'quality', title: 'Quality'});
                    }

                    if (fParams[0].optimization_create === true || fParams[0].optimization_transparency === true) {
                        tabs.push({href: 'optimization', title: 'Optimization Impact'});
                    }

                    isAgencyCostModelTransparent = loginModel.getIsAgencyCostModelTransparent();

                    // if agency level cost model is opaque
                    if (!isAgencyCostModelTransparent) {
                        tabs = _.filter(tabs, function (obj) {
                            return obj.href !== 'cost';
                        });
                    }

                    userRole = RoleBasedService.getClientRole() && RoleBasedService.getClientRole().uiExclusions;

                    if (userRole && userRole.ui_modules) {
                        tabs = _.filter(tabs, function (obj) {
                            return _.indexOf(userRole.ui_modules, obj.href) === -1;
                        });
                    }

                    return {
                        tabs: tabs,
                        activeTab: $location.path()
                    };
                },

                getCustomReportsTabs: function () {
                    var tabs = [],
                        fParams = featuresService.getFeatureParams();

                    if (fParams[0].scheduled_reports === true) {
                        tabs.push({ href:'reports/schedules', title: 'My Reports'});
                    }

                    if (fParams[0].collective_insights === true) {
                        tabs.push({href: 'reports/list', title: 'Collective Insights'});
                    }

                    return {
                        tabs: tabs,
                        activeTab: $location.path()
                    };
                },

                highlightHeaderMenu: function () {
                    // Hot fix to show the campaign tab selected
                    $('.main_navigation')
                        .find('.active')
                        .removeClass('active')
                        .end()
                        .find('#reports_nav_link')
                        .addClass('active');
                },

                highlightSubHeaderMenu: function () {
                    $('.reports_sub_menu_dd')
                        .find('.active_tab')
                        .removeClass('active_tab')
                        .end()
                        .find('#' + document.location.pathname.substring(1))
                        .addClass('active_tab');
                },

                checkForCampaignFormat: function (adFormats) {
                    var videoAdsExists,
                        displayAdsExists;

                    adFormats = _.flatten(adFormats);
                    videoAdsExists = _.contains(adFormats, 'VIDEO');

                    // Ex: ['VIDEO'], ['VIDEO', 'SOCIAL'], ['VIDEO', 'SOCIAL', 'RICH_MEDIA']
                    displayAdsExists = !(videoAdsExists && adFormats.length === 1);

                    return {
                        videoAds: videoAdsExists,
                        displayAds: displayAdsExists
                    };
                }
            };
        }
    );

    angularAMD.directive('reportTabs', ['$http', '$compile', 'constants', 'featuresService', '$rootScope',
        'localStorageService','$timeout', function () {
        return {
            controller: function () {},
            restrict: 'EAC',

            templateUrl: assets.html_report_header_tab,

            link: function () {}
        };
    }]);

    angularAMD.directive('addfilter', function ($http, $compile) {
        return {
            restrict: 'EAC',

            link: function ($scope, element) {
                var template;

                element.bind('click', function () {
                    $http
                        .get(assets.html_add_report_filter)
                        .then(function (tmpl) {
                            $scope.dimensionQuery = '';
                            template = $compile(tmpl.data)($scope);

                            angular
                                .element(document.getElementById('filter_breakdown_row'))
                                .append(template);

                            $('.custom_filter_dropdown .dropdown-menu').find('input').on('click', function (e) {
                                e.stopPropagation();
                            });
                        });
                });
            },

            controller: function () {}
        };
    });

    angularAMD.directive('addmore', function ($http, $compile) {
        return {
            restrict: 'EAC',

            link: function ($scope, element) {
                var template;

                element.bind('click', function () {
                    $http
                        .get(assets.html_add_report_dimension)
                        .then(function (tmpl) {
                            template = $compile(tmpl.data)($scope);

                            angular
                                .element(document.getElementById('breakdown_row'))
                                .append(template);

                            if ($('#breakdown_row').find('.breakdown_div').length >= 0) {
                                $('.add_breakdown_btn').closest('.row').hide();
                            } else {
                                $('.add_breakdown_btn').closest('.row').show();
                            }
                        });
                });
            }
        };
    });

    angularAMD.directive('addfilterusers', function ($http, $compile) {
        return {
            restrict: 'EAC',

            link: function ($scope, element) {
                var template;

                element.bind('click', function () {
                    $http
                        .get(assets.html_add_filter_users)
                        .then(function (tmpl) {
                            template = $compile(tmpl.data)($scope);

                            angular
                                .element(document.getElementById('filter-container'))
                                .append(template);
                        });
                });
            }
        };
    });

    angularAMD.directive('downloadReport', function ($http, $location, loginModel, advertiserModel, brandsModel,
                                                     dataService, urlService, vistoconfig, constants) {
        return {
            controller: function () {},
            restrict: 'EAC',

            templateUrl: assets.html_download_report,

            link: function ($scope, element) {
                $scope.textConstants = constants;

                element.bind('click', function () {});

                $scope.downloadPerformanceReport = function (report) {
                    var reportUrl,

                        queryObj = {
                            url: report.url,
                            queryId: report.query_id,
                            clientId: vistoconfig.getSelectedAccountId(),
                            campaignId: $scope.selectedCampaign.id,
                            advertiserId: vistoconfig.getSelectAdvertiserId(),
                            brandId: vistoconfig.getSelectedBrandId(),
                            dateFilter: 'life_time',
                            download_config_id: report.download_config_id
                        };

                    if (queryObj.queryId === 29 ||
                        queryObj.queryId === 16 ||
                        queryObj.queryId === 30 ||
                        queryObj.queryId === 31 ||
                        queryObj.queryId === 32) { // jshint ignore:line
                        // we need not do any thing since for these query id we need not to pass the ad group id.
                    } else {
                        queryObj.adGroupId = -1;
                    }

                    reportUrl = urlService.APIVistoCustomQuery(queryObj);
                    (queryObj.queryId === 26 || queryObj.queryId === 28) && (reportUrl += '&result_count=2000');

                    if (report.report_cat && report.report_type) {
                        reportUrl += '&report_cat=' + report.report_cat + '&report_type=' + report.report_type;
                    }

                    if (!loginModel.cookieExists()) {
                        loginModel.checkCookieExpiry();
                    } else {
                        $scope.reportDownloadBusy = true;

                        dataService
                            .downloadFile(reportUrl)
                            .then(function (response) {
                                if (response.status === 'success') {
                                    $scope.reportDownloadBusy = false;
                                    saveAs(response.file, response.fileName);
                                } else {
                                    $scope.reportDownloadBusy = false;
                                }
                            }, function () {
                                $scope.reportDownloadBusy = false;
                            }, function () {
                                $scope.reportDownloadBusy = false;
                            });
                    }
                };
            }
        };
    });

    angularAMD.directive('screenHeader', ['$http', '$compile', 'constants', function ($http, $compile, constants) {
        return {
            controller: function () {},
            restrict: 'EAC',

            templateUrl: assets.html_screen_header,

            link: function (scope) {
                scope.textConstants = constants;
            }
        };
    }]);

    angularAMD.directive('daysofweekHeader', ['$http', '$compile', 'constants', function ($http, $compile, constants) {
        return {
            controller: function () {},
            restrict: 'EAC',

            templateUrl: assets.html_daysofweek_header,

            link: function (scope) {
                scope.textConstants = constants;
            }
        };
    }]);

    angularAMD.directive('discrepancyHeader', ['$http', '$compile', 'constants', function ($http, $compile, constants) {
        return {
            controller: function () {},
            restrict:'EAC',

            templateUrl: assets.html_discrepancy_header,

            link: function (scope) {
                scope.textConstants = constants;
            }
        };
    }]);

    angularAMD.directive('adminHeader', ['$http', '$compile', 'constants', function ($http, $compile, constants) {
        return {
            controller: function () {},
            restrict:'EAC',

            templateUrl: assets.html_admin_header,

            link: function (scope) {
                scope.textConstants = constants;
            }
        };
    }]);

    angularAMD.directive('adminSubHeader', ['$http', '$compile', 'constants', function ($http, $compile,constants) {
        return {
            controller: function () {},
            restrict:'EAC',

            templateUrl: assets.html_admin_sub_header,

            link: function (scope) {
                scope.textConstants = constants;
            }
        };
    }]);

    angularAMD.directive('formatHeader', ['$http', '$compile', 'constants', function ($http, $compile, constants) {
        return {
            controller: function () {},
            restrict: 'EAC',

            templateUrl: assets.html_format_header,

            link: function (scope) {
                scope.textConstants = constants;
            }
        };
    }]);

    angularAMD.directive('performanceHeader', ['$http', '$compile', 'constants', function ($http, $compile, constants) {
        return {
            controller: function () {},
            restrict: 'EAC',

            templateUrl: assets.html_performance_header,

            link: function (scope) {
                scope.textConstants = constants;
            }
        };
    }]);

    angularAMD.directive('costHeader', ['$http', '$compile', 'constants', function ($http, $compile, constants) {
        return {
            controller: function () {},
            restrict: 'EAC',

            templateUrl: assets.html_cost_header,

            link: function (scope) {
                scope.textConstants = constants;
            }
        };
    }]);

    angularAMD.directive('viewablityHeader', ['$http', '$compile', 'constants', function ($http, $compile, constants) {
        return {
            controller: function () {},
            restrict: 'EAC',

            templateUrl: assets.html_viewablity_header,

            link: function (scope) {
                scope.textConstants = constants;
            }
        };
    }]);

    angularAMD.directive('marginHeader', ['$http', '$compile', 'constants', function ($http, $compile, constants) {
        return {
            controller: function () {},
            restrict: 'EAC',

            templateUrl: assets.html_margin_header,

            link: function (scope) {
                scope.textConstants = constants;
            }
        };
    }]);

    angularAMD.directive('uploadReportsFiltersHeader', ['$location', '$rootScope', '$http', '$compile', 'constants',
        'loginModel', 'accountService', 'vistoconfig', function ($location, $rootScope, $http, $compile, constants,
                                                  loginModel, accountService, vistoconfig) {
            return {
                controller: function () {
                },
                restrict: 'EAC',
                templateUrl: assets.html_upload_reports_filters_header,
                link: function (scope) {
                    var masterClient = accountService.getSelectedAccount();

                    scope.textConstants = constants;
                    scope.isLeafNode = true;

                    if (masterClient.isLeafNode === false) {
                        scope.isLeafNode = false;
                    }
                }
            };
        }]);

    angularAMD.directive('dashboardFiltersHeader', ['$location', '$rootScope', '$http', '$compile', 'constants',
        'loginModel', 'accountService', 'vistoconfig', function ($location, $rootScope, $http, $compile, constants,
                                                  loginModel, accountService, vistoconfig) {
            return {
                controller: function ($scope) {
                    $scope.textConstants = constants;
                    var masterClient = accountService.getSelectedAccount();
                    $scope.isLeafNode = true;
                    if(masterClient.isLeafNode === false) {
                        $scope.isLeafNode = false;
                    }
                },
                restrict: 'EAC',
                templateUrl: assets.html_dashboard_filters_header,
                link: function () {

                }
            };
        }]);

    angularAMD.directive('filtersHeader', ['$location','$rootScope','$http', '$compile', 'constants','vistoconfig',
        function ($location,$rootScope,$http, $compile, constants, vistoconfig) {
            return {
                controller: function () {},
                restrict: 'EAC',

                templateUrl: assets.html_filters_header,

                link: function (scope, element, attrs) {
                    var masterClient = accountService.getSelectedAccount(),
                        locationUrl;

                    scope.reportFilter = attrs.reports;
                    scope.textConstants = constants;
                    scope.showStrategies = attrs.strategies;
                    scope.isLeafNode = true;

                    if (masterClient.isLeafNode === false) {
                        scope.isLeafNode = false;
                    }

                    locationUrl = $location.url();

                    if (locationUrl === '/reports/list') {
                        scope.allCampaign = true;
                    } else {
                        scope.allCampaign = false;
                    }
                }
            };
        }
    ]);

    angularAMD.directive('ngUpdateHiddenDropdown', function () {
        return function (scope, el, attr) {
            var model = attr.ngModel;

            scope.$watch(model, function (nv) {
                el.val(nv);
                scope.permissions.push(nv);
            });
        };
    });

    angularAMD.directive('ngUpdateHiddenDays', function () {
        return function (scope, el, attr) {
            var model = attr.ngModel;

            scope.$watch(model, function (nv) {
                if (nv) {
                    el.val(nv);
                    scope.selectedDays[attr.index] = el.val();
                    scope.Schedule.dayPart[parseInt(attr.index)][attr.field] = el.val();
                }
            });
        };
    });

    angularAMD.directive('ngUpdateHiddenDropdwn', function () {
        return function (scope, el, attr) {
            var model = attr.ngModel;

            scope.$watch(model, function (nv) {
                el.val(nv);
                scope.allPermissions.push(nv);
            });
        };
    });

    angularAMD.directive('creativesHeader', ['$http', '$compile', 'constants', function ($http, $compile, constants) {
        return {
            controller: function () {},
            restrict: 'EAC',

            templateUrl: assets.html_creatives_header,

            link: function (scope) {
                scope.textConstants = constants;
            }
        };
    }]);

    angularAMD.directive('adsizesHeader', ['$http', '$compile', 'constants', function ($http, $compile, constants) {
        return {
            controller: function () {},
            restrict: 'EAC',

            templateUrl: assets.html_adsizes_header,

            link: function (scope) {
                scope.textConstants = constants;
            }
        };
    }]);
});
