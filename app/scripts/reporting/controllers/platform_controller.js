define(['angularAMD','kpi-select-model', 'campaign-select-model', 'strategy-select-service', 'time-period-model', 'url-service', 'request-cancel-service', 'common-utils',
    'strategy-select-directive','strategy-select-controller', 'time-period-pick-directive', 'kpi-select-directive'],
    function (angularAMD) {
        'use strict';

        angularAMD.controller('PlatformController', ['$scope', '$rootScope', 'kpiSelectModel', 'campaignSelectModel', 'strategySelectModel', 'dataService', 'constants',
            'domainReports', 'vistoconfig', 'timePeriodModel', 'loginModel', 'RoleBasedService', 'advertiserModel', 'brandsModel', 'urlService', 'featuresService',
            'requestCanceller', 'utils', 'pageLoad',
            function ($scope, $rootScope, kpiSelectModel, campaignSelectModel, strategySelectModel, dataService, constants, domainReports, vistoconfig, timePeriodModel,
                      loginModel, RoleBasedService, advertiserModel, brandsModel, urlService, featuresService, requestCanceller, utils, pageLoad) {
            var _currCtrl = this,
                extractAdFormats;

            console.log('PLATFORM controller is loaded!');
            // Hide page loader when the page is loaded
            pageLoad.hidePageLoader();

            $scope.textConstants = constants;

            // set the default sort type
            $scope.sortType = 'impressions';
            $scope.sortReverse = false;
            $scope.sortReverseKpiDropdown = true;

            $scope.kpiDropdownActive = {};

            $scope.isStrategyDropDownShow = true;

            if ($scope.selected_tab === 'performance') {
                $scope.sortType = 'impressions';
            } else if ($scope.selected_tab === 'viewability') {
                $scope.sortType = 'other_view_impressions';
            } else {
                $scope.sortType = 'impressions';
            }

            $scope.strategyLoading = true;
            $scope.strategyFound = true;

            // highlight the header menu - Dashborad, Campaigns, Reports
            domainReports.highlightHeaderMenu();

            // setting selected campaign into $scope.
            $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign();

            // setting selected strategy into $scope.
            $scope.selectedStrategy = strategySelectModel.getSelectedStrategy();

            // building the reports tab (Performance, Cost, Platform, Inventory, Viewability, Optmization Report)
            $scope.filters = domainReports.getReportsTabs();

            // set default api return code 200
            $scope.apiReturnCode = 200;

            $scope.usrRole = RoleBasedService.getClientRole() && RoleBasedService.getClientRole().uiExclusions;

            $scope.getMessageForDataNotAvailable = function (campaign) {
                campaign = campaign || $scope.campaign;
                if (!campaign || campaign.id === -1) {
                    return constants.MSG_DATA_NOT_AVAILABLE;
                } else if ($scope.apiReturnCode === 404 || $scope.apiReturnCode >= 500) {
                    return constants.MSG_UNKNOWN_ERROR_OCCURED;
                } else if (campaignSelectModel.durationLeft() === 'Yet to start') {
                    return utils.formatStringWithDate(constants.MSG_CAMPAIGN_YET_TO_START ,campaign.startDate,constants.REPORTS_DATE_FORMAT);
                } else if (campaignSelectModel.daysSinceEnded() > 1000) {
                    return constants.MSG_CAMPAIGN_VERY_OLD;
                } else if ($scope.selectedCampaign.kpi === 'null') {
                    return constants.MSG_CAMPAIGN_KPI_NOT_SET;
                } else {
                    return constants.MSG_DATA_NOT_AVAILABLE;
                }
            };

            // set default selected tab to Performance.
            $scope.selected_tab = 'performance';

            $scope.clickToSort = function(type){
                $scope.sortType = type;
                $scope.sortReverse = !$scope.sortReverse;
                $scope.specialSort(type);
                $scope.removeKpiActive();
            };

            $scope.sortClassFunction = function(a){
                var isActive = (a === $scope.sortType) ?  'active' : '',
                    sortDirection = ($scope.sortReverse === true) ?  'sort_order_up' : 'sort_order_down';

                $('.direction_arrows div.kpi_arrow_sort.active').hide();

                if ($('.kpi-dd-holder').hasClass('active')) {
                    $('.each_cost_col').removeClass('active');
                    return sortDirection;
                } else{
                    return isActive + ' ' + sortDirection;
                }
            };

            $scope.specialSort = function(passedSortype){
                if (Number($scope.selectedStrategy.id) >= 0) {
                    $scope.tacticPlatformData = _.sortBy( $scope.tacticPlatformData, function(item) {
                        return $scope.sortReverse ? -item[0][passedSortype] : item[0][passedSortype];
                    });
                } else {
                    $scope.sortType = passedSortype;
                }
            };

            $scope.getPlatformData = function () {
                var datefilter = timePeriodModel.getTimePeriod(timePeriodModel.timeData.selectedTimePeriod.key),
                    tab,
                    errorHandlerForPerformanceTab,
                    url,
                    canceller,

                    param = {
                        campaignId: $scope.selectedCampaign.id,
                        clientId: vistoconfig.getSelectedAccountId(),
                        advertiserId: vistoconfig.getSelectAdvertiserId(),
                        brandId: vistoconfig.getSelectedBrandId(),
                        dateFilter: datefilter
                    };

                if ($scope.selected_tab === 'margin') {
                    param.dateFilter = 'life_time';
                    if (Number($scope.selectedStrategy.id) >= 0) {
                        param.queryId = 41;
                        param.strategyId = Number($scope.selectedStrategy.id);
                    } else {
                        param.queryId = 40;
                    }
                } else {
                    if (Number($scope.selectedStrategy.id) >= 0) {
                        param.queryId = 24;
                        param.strategyId = Number($scope.selectedStrategy.id);
                    }
                    else {
                        param.queryId = 23;
                    }
                }


                $scope.performanceBusy = true;
                $scope.costBusy = true;
                $scope.viewabilityBusy = true;
                $scope.marginBusy = true;

                tab = $scope.selected_tab.substr(0, 1).toUpperCase() + $scope.selected_tab.substr(1);

                errorHandlerForPerformanceTab = function (result) {
                    if (result.data.status !== 0) {
                        $scope['dataNotFoundFor' + tab] = true;
                    }
                };

                $scope.apiReturnCode = 200;
                url = urlService.APIVistoCustomQuery(param);
                requestCanceller.cancelLastRequest(constants.PLATFORM_TAB_CANCELLER);
                canceller = requestCanceller.initCanceller(constants.PLATFORM_TAB_CANCELLER);

                dataService.fetchCancelable(url, canceller, function (result) {
                    var marginPercentage,
                        sumTechFeesNServiceFees;

                    $scope.strategyLoading = false;
                    if (result.status === 'OK' || result.status === 'success') {
                        $scope.performanceBusy = false;
                        $scope.costBusy = false;
                        $scope.viewabilityBusy = false;
                        $scope.marginBusy = false;

                        if (result.data.data.length === 0) {
                            errorHandlerForPerformanceTab();
                        } else {
                            marginPercentage = function (item) {
                                if (item.spend && item.spend !== 0) {
                                    item.margin = item.margin * 100 / item.spend;
                                }
                            };

                            sumTechFeesNServiceFees = function(item) {
                                if (item.tech_fees === null && item.service_fees === null) {
                                    item.tech_service_fees_total = undefined;
                                } else {
                                    item.tech_service_fees_total = (item.tech_fees === null ?
                                            0 : item.tech_fees) + (item.service_fees === null ?
                                            0 : item.service_fees);
                                }
                            };

                            if (Number($scope.selectedStrategy.id) >= 0) {
                                // strategy selected
                                $scope.platformData = _.filter(result.data.data, function (item) {
                                    if(item.platform_name === 'Line Item Totals') {
                                        item.sepratorCls_platform = 'sepratorCls_platform';
                                    }
                                    return (item.ad_id === -1 && item.ad_group_name === '');
                                });

                                _.each($scope.platformData, function (item) {
                                    sumTechFeesNServiceFees(item);
                                    marginPercentage(item);
                                    item.kpi_type = $scope.selectedFilters.campaign_default_kpi_type;
                                });

                                $scope.tacticPlatformData = _.filter(result.data.data, function (item) {
                                    return item.ad_id !== -1 && item.ad_group_name !== '';
                                });

                                _.each($scope.tacticPlatformData, function (item) {
                                    sumTechFeesNServiceFees(item);
                                    marginPercentage(item);
                                });

                                var tacticPlatformData = [],
                                    tempArr = [],
                                    isExist = [],
                                    tempVal = null;

                                _.each($scope.tacticPlatformData, function(item){
                                    if(isExist.indexOf(item.ad_id) === -1) {
                                        isExist.push(item.ad_id);
                                        tempArr = _.filter($scope.tacticPlatformData, function (v) {
                                            return v.ad_id === item.ad_id;
                                        });
                                        if(!tempArr[0].platform_name || (tempArr[0].platform_name !== 'Ad Item' +
                                            ' Totals' && tempArr[0].platform_name !== 'Ad Totals')){
                                            tempVal = tempArr[1];
                                            tempArr[1] = tempArr[0];
                                            tempArr[0] = tempVal;
                                        }
                                        tacticPlatformData.push(tempArr);
                                    }
                                });

                                $scope.tacticPlatformData = tacticPlatformData;
                            } else {
                                $scope.platformData = result.data.data;

                                _.each($scope.platformData, function (item) {
                                    if(item.platform_name === 'Media Plan Totals') {
                                        item.sepratorCls_platform = 'sepratorCls_platform';
                                    }
                                    sumTechFeesNServiceFees(item);
                                    marginPercentage(item);
                                    item.kpi_type = $scope.selectedFilters.campaign_default_kpi_type;
                                });

                                $scope['dataNotFoundFor' + tab] = false;
                            }
                        }
                    } else {
                        errorHandlerForPerformanceTab(result);
                    }
                }, errorHandlerForPerformanceTab);
            };

            // strategy change handler
            $scope.strategyChangeHandler = function () {
                $scope.reportDownloadBusy = false;

                if ($scope.selectedStrategy.id === -99) {
                    $scope.strategyFound = false;
                } else {
                    $scope.strategyFound = true;
                    $scope.getPlatformData();
                }
            };

            // whenever strategy change either by broadcast or from dropdown
            $scope.$on(constants.EVENT_CAMPAIGN_CHANGED, function () {
                $scope.init();

                // update the selected Campaign
                $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign();
            });

            $scope.$watch('selectedCampaign', function () {
                _currCtrl.createDownloadReportUrl();
                _currCtrl.filterCostReport();
            });

            // creating download report url
            _currCtrl.createDownloadReportUrl = function () {
                var download_report = [
                        {
                            name: 'by_performance',
                            url: '/reportBuilder/customQueryDownload',
                            query_id: 24,
                            label: 'Platform by Performance',
                            download_config_id: 1
                        },

                        {
                            name: 'by_cost',
                            url: '/reportBuilder/customQueryDownload',
                            query_id: 24,
                            label: 'Platform by Cost',
                            className: 'report_cost',
                            download_config_id: 2

                        },

                        {
                            name: 'by_quality',
                            url: '/reportBuilder/customQueryDownload',
                            query_id: 24,
                            label: 'Platform by Quality',
                            download_config_id: 3
                        }
                    ];


                $scope.download_report = download_report;
            };

            extractAdFormats =  function () {
                $scope.adFormats = domainReports.checkForCampaignFormat(strategySelectModel.allAdFormats());
                $scope.videoMode = $scope.adFormats && $scope.adFormats.videoAds;
            };

            // resetting the variable
            $scope.resetVariables = function () {
                $scope.performanceBusy = false;
                $scope.costBusy = false;
                $scope.viewabilityBusy = false;
                $scope.marginBusy = false;

                $scope.platformData = [];
                $scope.tacticPlatformData = [];

                $scope.dataNotFoundForPerformance = false;
                $scope.dataNotFoundForCost = false;
                $scope.dataNotFoundForViewability = false;
                $scope.dataNotFoundForMargin = false;
            };

            // event handler which toggle platform
            $scope.togglePlatformRow = function (e) {
                var targetRow = $(e.currentTarget),
                    platformRow = targetRow.closest('.each_row_list');

                if (platformRow.hasClass('expandRow')) {
                    platformRow.removeClass('expandRow');
                    platformRow.addClass('collapseRow');
                } else {
                    platformRow.removeClass('collapseRow');
                    platformRow.addClass('expandRow');
                }

                platformRow.find('.platform_row').toggle('slow', function () {});
            };

            // Initializing the variable.
            $scope.init = function () {
                $scope.strategyFound = false;
                $scope.strategyLoading = true;
                $scope.apiReturnCode = 200;
                $scope.isStrategyDataEmpty = false;
                $scope.strategies = {};
                $scope.resetVariables();
                $scope.selectedFilters = {};

                $scope.selectedFilters.campaign_default_kpi_type = $scope.selectedCampaign.kpi.toLowerCase();
                $scope.selectedFilters.kpi_type = kpiSelectModel.getSelectedKpi();

                $scope.selectedFilters.kpi_type = 'cpm';
                $scope.selectedFilters2 = {};
                $scope.selectedFilters2.kpi_type = 'cpm';
                $scope.someDummyVarDeleteLater = kpiSelectModel.setSelectedKpi('cpm');
            };

            $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign();
            $scope.init();
            extractAdFormats();
            $scope.strategyHeading = Number($scope.selectedStrategy.id) === vistoconfig.LINE_ITEM_DROPDWON_OBJECT.id ?
                constants.MEDIA_PLAN_TOTAL : constants.LINE_ITME_TOTAL;
            $scope.isStrategyDataEmpty = false;
            $scope.resetVariables();
            $scope.strategyChangeHandler();

            // Binding click event on tab and fetch strategy method.
            $(function () {
                $('.each_tab').click(function (event) {
                    var tab_id = $(this).attr('id').split('_tab'),
                        viewModeSwitchContainer = $('.view_mode_switch_container'),
                        tabImps = ['cpc', 'cpa', 'cpm', 'vtc', 'action_rate', 'ctr'];

                    $('.reports_tabs_holder').find('.active').removeClass('active');
                    $(this).addClass('active');
                    $('.reports_block').hide();
                    $scope.selected_tab = tab_id[0].split('_')[1];
                    viewModeSwitchContainer.hide();

                    if ($scope.selected_tab === 'viewability') {
                        if (jQuery.inArray($scope.sortTypeByViewability, tabImps) !== '-1') {
                            $('.kpi-dd-holder').addClass('active');
                        } else {
                            $scope.removeKpiActive();
                        }
                    } else if ($scope.selected_tab === 'performance') {
                        if (jQuery.inArray($scope.sortTypeByPerformance, tabImps) !== '-1') {
                            $('.kpi-dd-holder').addClass('active');
                        } else {
                            $scope.removeKpiActive();
                        }
                    } else if ($scope.selected_tab === 'cost') {
                        if (jQuery.inArray($scope.sortTypeByCost, tabImps) !== '-1') {
                            $('.kpi-dd-holder').addClass('active');
                        } else {
                            $scope.removeKpiActive();
                        }
                    } else if ($scope.selected_tab === 'margin') {
                        if (jQuery.inArray($scope.sortTypeByCost, tabImps) !== '-1') {
                            $('.kpi-dd-holder').addClass('active');
                        } else {
                            $scope.removeKpiActive();
                        }
                    }

                    if ($scope.selected_tab === 'viewability') {
                        viewModeSwitchContainer.show();
                        $('.lifetime_filter').css('display', 'block');

                        if (localStorage.getItem('timeSetTextLocStore') === '"Custom"') {
                            $('#newDatePickerBox').show();
                        }
                    } else if ($scope.selected_tab === 'cost') {
                        $('.lifetime_filter').css('display', 'block');

                        if (localStorage.getItem('timeSetTextLocStore') === '"Custom"') {
                            $('#newDatePickerBox').show();
                        }
                    } else if ($scope.selected_tab === 'performance') {
                        $('.lifetime_filter').css('display', 'block');

                        if (localStorage.getItem('timeSetTextLocStore') === '"Custom"') {
                            $('#newDatePickerBox').show();
                        }
                    } else if ($scope.selected_tab === 'margin') {
                        $('.lifetime_filter').css('display', 'none');
                        $('#newDatePickerBox').css('display', 'none');
                    } else {
                        viewModeSwitchContainer.hide();
                    }

                    $('#reports_' + tab_id[0] + '_block').show();
                    $scope.strategyChangeHandler();
                    event.preventDefault();
                });
            });

            $scope.$on(constants.EVENT_TIMEPERIOD_CHANGED, function (event, strategy) {
                $scope.selectedFilters.time_filter = strategy;
                $scope.resetVariables();
                $scope.strategyChangeHandler();
            });

            $scope.$on(constants.EVENT_KPI_CHANGED, function () {
                if ($scope.selectedFilters === undefined) {
                    $scope.selectedFilters = {};
                }

                $scope.selectedFilters.kpi_type = kpiSelectModel.getSelectedKpi();
                $scope.selectedFilters2 = {};
                $scope.selectedFilters2.kpi_type = kpiSelectModel.getSelectedKpiAlt();
            });

            _currCtrl.filterCostReport = function() {
                var fparams = featuresService.getFeatureParams();

                $scope.showCostWidget = fparams[0].cost;

                if (!$scope.showCostWidget) {
                    $scope.download_report = _.filter($scope.download_report, function (report) {
                        return report.name !== 'by_cost';
                    });
                }
            };

            // check the permission on load
            _currCtrl.filterCostReport();

            $rootScope.$on('features', function() {
                _currCtrl.filterCostReport();
            });

            $scope.$on('dropdown-arrow-clicked', function (event, args, sortorder) {
                $scope.sortType = args;
                $scope.sortTypeScreens = args;
                $scope.sortReverse = sortorder;
                $scope.kpiDropdownActive = true;
                $scope.specialSort(args);
            });

            $scope.removeKpiActive = function () {
                var dropListLi = $('.drop_list li');

                $('.kpi-dd-holder').removeClass('active');
                $('.dropdown_ul_text').removeClass('active');
                dropListLi.removeClass('active');
                dropListLi.css('color', '#57606d');
                $('.direction_arrows div.kpi_arrow_sort.active').hide();
                $('.direction_arrows div.kpi_arrow_sort').removeClass('active');
            };

            $scope.sortClassFunction = function (a) {
                var isActive = (a === $scope.sortType ) ? 'active' : '',
                    sortDirection = ($scope.sortReverse === true ) ? 'sort_order_up' : 'sort_order_down';

                if ($('.kpi-dd-holder').hasClass('active')) {
                    $('.each_cost_col').removeClass('active');
                    return sortDirection;
                } else {
                    return isActive + ' ' + sortDirection;
                }
            };

            $scope.platformIconUrl = function (name, iconUrl) {
                return '/images/platform_favicons/' + (iconUrl === 'Unknown' ?
                        'platform_logo.png' : name.toLowerCase().replace(/ /g, '_') + '.png');
            };

            // hot fix for the enabling the active link in the reports dropdown
            $(function () {
                var mainNavigation = $('.main_navigation');

                mainNavigation.find('.header_tab_dropdown').removeClass('active_tab');
                mainNavigation.find('.reports_sub_menu_dd_holder').find('#platform').addClass('active_tab');
            });
            // end of hot fix for the enabling the active link in the reports dropdown
        }]);
    }
);
