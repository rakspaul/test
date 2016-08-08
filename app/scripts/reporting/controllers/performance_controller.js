define(['angularAMD','reporting/kpiSelect/kpi_select_model', 'reporting/campaignSelect/campaign_select_model',
    'reporting/strategySelect/strategy_select_service', 'common/services/data_service',
    'reporting/models/domain_reports', 'common/services/constants_service', 'reporting/timePeriod/time_period_model',
    'reporting/brands/brands_model', 'login/login_model', 'common/services/url_service',
    'reporting/advertiser/advertiser_model', 'reporting/timePeriod/time_period_controller',
    'reporting/kpiSelect/kpi_select_directive', 'reporting/strategySelect/strategy_select_directive',
    'reporting/strategySelect/strategy_select_controller', 'reporting/timePeriod/time_period_pick_directive'],
    function (angularAMD) {
    'use strict';

    angularAMD.controller('PerformanceController', function ($scope,$rootScope, kpiSelectModel, campaignSelectModel,
                                                             strategySelectModel, dataService, domainReports, constants,
                                                             timePeriodModel, brandsModel, loginModel, urlService,
                                                             advertiserModel, featuresService) {
        var _customCtrl = this,
            extractAdFormats,

            performaceTabMap = [
                {byscreens: 'Screen'},
                {byformats: 'Format'},
                {byplatforms: 'Platform'},
                {bydaysofweek: 'DOW'},
                {bycreatives: 'Creatives'},
                {byadsizes: 'Adsizes'},
                {bydiscrepancy: 'Discrepancy'}
            ];

        $scope.textConstants = constants;

        // highlight the header menu - Dashboard, Campaigns, Reports
        domainReports.highlightHeaderMenu();
        domainReports.highlightSubHeaderMenu();

        $scope.sortType             = 'impressions';
        $scope.sortTypebyformats    = '-impressions';
        $scope.sortTypebyplatforms  = '-impressions';
        $scope.sortTypebydaysofweek = '-impressions';
        $scope.sortTypeByCreatives  = '-impressions';
        $scope.sortTypeByAdSizes    = '-impressions';
        $scope.sortTypeScreens      = '-impressions';
        $scope.sortTypediscrepancy  = '-imps';

        // set the default sort order
        $scope.sortReverse  = false;

        $scope.sortReverseFormatTab  = false;
        $scope.sortReverseAdSizeTab  = false;
        $scope.sortReverseCreativesTab  = false;
        $scope.sortReverseDaysTab  = false;

        $scope.sortReverseForCostscpm  = true;
        $scope.sortReverseForCostscpa  = true;
        $scope.sortReverseForCostscpc  = true;
        $scope.sortReverseAdSizes  = false;

        $scope.sortReverseForCostscpmFormats  = true;
        $scope.sortReverseForCostscpaFormats  = true;
        $scope.sortReverseForCostscpcFormats  = true;
        $scope.sortReverseAdSizesFormats  = true;

        $scope.sortReverseForCostscpmPlatforms  = true;
        $scope.sortReverseForCostscpaPlatforms   = true;
        $scope.sortReverseForCostscpcPlatforms    = true;
        $scope.sortReverseAdSizesPlatforms    = true;

        $scope.sortReverseForCostscpmDaysofweek  = true;
        $scope.sortReverseForCostscpaDaysofweek  = true;
        $scope.sortReverseForCostscpcDaysofweek  = true;
        $scope.sortReverseAdSizesDaysofweek  = true;

        $scope.sortReverseForCostscpmCreatives  = true;
        $scope.sortReverseForCostscpaCreatives  = true;
        $scope.sortReverseForCostscpcCreatives  = true;
        $scope.sortReverseAdSizesCreatives  = true;

        $scope.sortReverseForCostscpmAdsizes  = true;
        $scope.sortReverseForCostscpaAdsizes  = true;
        $scope.sortReverseForCostscpcAdsizes  = true;
        $scope.sortReverseAdSizesAdsizes  = true;

        $scope.isStrategyDropDownShow = true;
        $scope.characterLimit  = 50;

        $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign();
        $scope.selectedStrategy = strategySelectModel.getSelectedStrategy();

        $scope.apiReturnCode = 200;
        $scope.redirectWidget = $scope.selectedCampaign && $scope.selectedCampaign.redirectWidget;

        $scope.getMessageForDataNotAvailable = function (campaign) {
            campaign = campaign || $scope.campaign;

            if (!campaign || campaign.id === -1) {
                return constants.MSG_DATA_NOT_AVAILABLE;
            } else if ($scope.apiReturnCode === 404 || $scope.apiReturnCode >=500) {
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

        $scope.filters = domainReports.getReportsTabs();

        // We should not keep selected tab in $scope.selectedFilters object because it is altered by
        // directive_controller in callBackCampaingSuccess and then tab info is not set
        if ($scope.redirectWidget && $scope.redirectWidget === 'adsizes') {
            $scope.sortByColumn = 'dimension';
            $scope.activeAdSizeClass = 'active';
            $scope.defaultDisplayAdSize = 'display: block';
            $scope.defaultDisplayFormat = 'display: none';
            $scope.defaultDisplayScreen = 'display: none';
            $scope.selected_tab = 'by'+$scope.redirectWidget.toLowerCase();
        } else if ($scope.redirectWidget === 'formats') {
            $scope.sortByColumn = 'dimension';
            $scope.activeFormatClass = 'active';
            $scope.defaultDisplayFormat = 'display: block';
            $scope.defaultDisplayAdSize = 'display: none';
            $scope.defaultDisplayScreen = 'display: none';
            $scope.selected_tab = 'by'+$scope.redirectWidget.toLowerCase();
        } else {
            $scope.selected_tab = 'byscreens';
            $scope.sortByColumn = 'name';
            $scope.activeScreenClass = 'active';
            $scope.defaultDisplayScreen = 'display: block';
            $scope.defaultDisplayAdSize = 'display: none';
            $scope.defaultDisplayFormat = 'display: none';
        }

        $scope.strategyLoading =  true;
        $scope.strategyFound = true;
        $scope.vendorList = [];

        $scope.download_urls = {
            screens: null,
            daysOfWeek: null,
            platforms: null
        };

        $scope.checkForSelectedTabData =  function (data) {
            var totalImpression = _.reduce(data, function (sum, d) {
                return sum + d.impressions;
            }, 0);

            return totalImpression === 0;
        };

        $scope.getPerformanceData =  function () {
            var performanceQueryIdMapperWithAllAdsGroup = {
                    screen: 7,
                    format: 8,
                    adsizes: 9,
                    creatives: 10,
                    dow: 11,
                    discrepancy: 44
                },

                performanceQueryIdMapperWithSelectedAdsGroup = {
                    screen: 17,
                    format: 18,
                    adsizes: 19,
                    creatives:20,
                    dow:21,
                    discrepancy: 45
                },

                dateFilter = timePeriodModel.getTimePeriod(timePeriodModel.timeData.selectedTimePeriod.key),

                param = {
                    campaignId: $scope.selectedCampaign.id,
                    clientId:  loginModel.getSelectedClient().id,
                    advertiserId: advertiserModel.getSelectedAdvertiser().id,
                    brandId: brandsModel.getSelectedBrand().id,
                    dateFilter: dateFilter,
                    tab: $scope.selected_tab
                },

                errorHandlerForPerformanceTab = function () {
                    $scope['dataNotFoundFor' + tab] = true;
                    $scope.showPerfMetrix = false;
                },

                url,
                tab = _.compact(_.pluck(performaceTabMap, [param.tab]))[0];

            if (Number($scope.selectedStrategy.id) >= 0) {
                param.queryId = performanceQueryIdMapperWithSelectedAdsGroup[tab.toLowerCase()];
                param.strategyId = Number($scope.selectedStrategy.id);
            } else {
                param.queryId = performanceQueryIdMapperWithAllAdsGroup[tab.toLowerCase()];
            }

            $scope.screenBusy = true;
            $scope.formatBusy = true;
            $scope.dowBusy = true;
            $scope.creativeBusy = true;
            $scope.adSizesBusy = true;
            $scope.showPerfMetrix = false;
            $scope.discrepancyBusy = true;

            $scope.apiReturnCode=200;

            url = urlService.APIVistoCustomQuery(param);
            $scope.selectedVendor = '';

            return dataService
                .fetch(url)
                .then(function (result) {
                    $scope.strategyLoading =  false;
                    $scope.vendorList = [];
                    _customCtrl.selectedVendorImps = {};

                    if (result.status === 'OK' || result.status === 'success') {
                        $scope['dataNotFoundFor' + tab] = false;
                        $scope.hidePerformanceReportTab = $scope.checkForSelectedTabData(result.data.data, tab);

                        if ($scope.hidePerformanceReportTab) {
                            errorHandlerForPerformanceTab();
                        } else {
                            $scope.screenBusy = false;
                            $scope.formatBusy = false;
                            $scope.dowBusy = false;
                            $scope.creativeBusy = false;
                            $scope.adSizesBusy = false;
                            $scope.discrepancyBusy = false;

                            if (Number($scope.selectedStrategy.id) >= 0) {
                                // Ad group total
                                $scope.showPerfMetrix = true;

                                $scope['strategyPerfDataBy' + tab]  =
                                    _.filter(result.data.data, function (item) {
                                        return item.ad_id === -1 && item.ad_group_id === -1;
                                    });

                                _.each($scope['strategyPerfDataBy' + tab], function (item) {
                                    item.kpi_type = $scope.selectedFilters.campaign_default_kpi_type;
                                });

                                $scope['strategyPerfDataByTactic' + tab]  =
                                    _.filter(result.data.data, function (item) {
                                        return item.ad_id !== -1 && item.ad_group_id !== -1;
                                    });

                                $scope.groupThem = _.chain($scope['strategyPerfDataByTactic' + tab])
                                    .groupBy('ad_id')
                                    .map(function (value, key) {
                                        return {
                                            ad_id: key,
                                            name: value[0].ad_name,
                                            perf_metrics: value
                                        };
                                    })
                                    .value();
                            } else {
                                // Media Plan total
                                $scope.showPerfMetrix = false;
                                $scope['strategyPerfDataBy' + tab]  = result.data.data;

                                _.each($scope['strategyPerfDataBy' + tab], function (item) {
                                    item.kpi_type = $scope.selectedFilters.campaign_default_kpi_type;
                                });
                            }

                            if (param.tab === 'bydiscrepancy') {
                                // remove duplicate SOR name
                                $scope['strategyPerfDataBy' + tab] = _customCtrl.removeDuplicateSOR(
                                    $scope['strategyPerfDataBy' + tab]);
                                _.each($scope.groupThem, function(item) {
                                    item.perf_metrics = _customCtrl.removeDuplicateSOR(item.perf_metrics);
                                });

                                _.each($scope['strategyPerfDataBy' + tab], function (item) {
                                    var vendorName = (item.nodes.length === 1) ? item.nodes[0].name : item.category;

                                    $scope.vendorList.push({
                                        name: vendorName,
                                        imps: item.imps,
                                        category: item.category
                                    });

                                    if (!$scope.selectedVendor) {
                                        $scope.selectedVendor = vendorName;
                                        $scope.selectedVendorImps = item.imps;
                                        $scope.selectedCategoryType = item.category;
                                    }
                                });
                            }
                        }
                    } else {
                        errorHandlerForPerformanceTab(result);
                    }
                }, errorHandlerForPerformanceTab);
        };

        _customCtrl.removeDuplicateSOR = function(vendorData) {
            var sorRecord = _.find(vendorData, function(item) {
                return item.category === 'System of Record';
            });
            if (sorRecord && sorRecord.nodes.length === 1) {
                return _.reject(vendorData, function (item) {
                        return item.nodes.length === 1 &&
                            item.nodes[0].name.toUpperCase() === sorRecord.nodes[0].name.toUpperCase() &&
                            item.category !== sorRecord.category;
                    });
            } else {
                return vendorData;
            }

        };

        $scope.select_vender_option = function (arg) {
            $scope.selectedVendor = arg;

            _.each($scope.vendorList, function (item) {
                if (item.name === arg) {
                    $scope.selectedVendorImps = item.imps;
                    $scope.selectedCategoryType = item.category;
                }
            });
        };

        $scope.discrepancy_click_first_level = function (index, event) {
            var elem = $(event.target);

            $('#discrepancy_2nd_level_' + index).slideToggle();
            elem.closest('.discrepancyTplRow').toggleClass('open');
        };

        $scope.getRateOfDiscrepancy = function (imps1, adId) {
            var retVal = '',
                imps2 = Number($scope.selectedStrategy.id) >= 0 ?
                    _customCtrl.selectedVendorImps[adId] : $scope.selectedVendorImps;

            if (!imps1 && !imps2) {
                retVal = '0%';
            }else if (!imps2) {
                retVal = 'NA';
            }else {
                retVal = Math.floor(((imps2 - imps1) / imps2) * 100) + '%';
            }

            return retVal;
        };

        $scope.getDiscrepancyImpsGap = function (vendorImps, adId) {
            if (Number($scope.selectedStrategy.id) >= 0) {
                if (adId === -1) {
                    _.each($scope.strategyPerfDataByDiscrepancy, function (item) {
                        if (item.category === $scope.selectedCategoryType) {
                            _customCtrl.selectedVendorImps['-1'] = item.imps;
                        }
                    });
                } else {
                    _.each($scope.strategyPerfDataByTacticDiscrepancy, function (item) {
                        if (item.ad_id === adId && (item.category === $scope.selectedCategoryType)) {
                            _customCtrl.selectedVendorImps[adId] = item.imps;
                        }
                    });
                }

                return (_customCtrl.selectedVendorImps[adId] - vendorImps);
            } else {
                return ($scope.selectedVendorImps - vendorImps);
            }
        };

        $scope.$on(constants.EVENT_CAMPAIGN_CHANGED, function () {
            $scope.init();

            // update the selected Campaign
            $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign();

            $scope.selectedFilters.kpi_type = campaignSelectModel.getSelectedCampaign().kpi;
        });

        $scope.$watch('selectedCampaign', function () {
            _customCtrl.createDownloadReportUrl();
            _customCtrl.filterDiscrepancyReport();
        });
        $scope.$watch('[adFormats.videoAds, selected_tab]', function (arr) {
            var width = (arr[0] || arr[1] == "bydiscrepancy") ? "100%" : "1985px";
            $(".reports_performance_header, .strategy_total_container").css("width",width);
        });

        extractAdFormats =  function () {
            $scope.adFormats = domainReports.checkForCampaignFormat(strategySelectModel.allAdFormats());
            $scope.videoMode = $scope.adFormats && $scope.adFormats.videoAds;
        };

        $scope.$on(constants.EVENT_STRATEGY_CHANGED, function () {
            var selectedStrategyObj = strategySelectModel.getSelectedStrategy();

            extractAdFormats();
            $scope.selectedStrategy.id = selectedStrategyObj.id;
            $scope.selectedStrategy.name = selectedStrategyObj.name;

            $scope.strategyHeading = Number($scope.selectedStrategy.id) >= 0 ?
                constants.LINE_ITME_TOTAL : constants.MEDIA_PLAN_TOTAL;

            $scope.viewLabelTxt = 'Numbers shown in bold indicate Target KPI';
            $scope.isStrategyDataEmpty = false;
            $scope.resetVariables();
            $scope.strategyChangeHandler();
        });

        // creating download report url
        _customCtrl.createDownloadReportUrl = function () {
            $scope.download_report = [
                {
                    name: 'by_screens',
                    url: '/reportBuilder/customQueryDownload',
                    query_id: 29,
                    label: 'Performance by Screens & Formats',
                    download_config_id: 1

                },

                {
                    name: 'by_ad_sizes',
                    url: '/reportBuilder/customQueryDownload',
                    query_id: 19,
                    label: 'Performance by Ad Sizes',
                    download_config_id: 1
                },

                {
                    name: 'by_creatives',
                    url : '/reportBuilder/customQueryDownload',
                    query_id: 20,
                    label : 'Performance by Creatives',
                    download_config_id: 1
                },

                {
                    name: 'by_days_off_week',
                    url : '/reportBuilder/customQueryDownload',
                    query_id: 21,
                    label : 'Performance by Days Of Week',
                    download_config_id: 1
                },
                {
                    name: 'by_discrepancy',
                    url: '/reportBuilder/customQueryDownload',
                    query_id: 45,
                    label: 'Performance by Discrepancy',
                    download_config_id: 1
                }
            ];
        };

        // Function is called from startegylist directive
        $scope.strategyChangeHandler = function () {
            $scope.reportDownloadBusy = false;

            if ($scope.selectedStrategy.id === -99 ) {
                $scope.strategyFound = false;
            } else {
                $scope.strategyFound = true;
                $scope.getPerformanceData();
            }
        };

        // resetting the variable
        $scope.resetVariables =  function () {
            $scope.screenBusy = false;
            $scope.formatBusy = false;
            $scope.dowBusy = false;
            $scope.creativeBusy = true;
            $scope.adSizesBusy = true;

            $scope.strategyPerfDataByScreen = [];
            $scope.strategyPerfDataByFormat = [];
            $scope.strategyPerfDataByDOW = [];
            $scope.strategyPerfDataByCreative = [];
            $scope.strategyPerfDataByAdsizes = [];

            $scope.dataNotFoundForScreen = false;
            $scope.dataNotFoundForFormat = false;
            $scope.dataNotFoundForDOW = false;
            $scope.dataNotFoundForCreative = false;
            $scope.dataNotFoundForAdSizes = false;
        };

        // Initializing the variable.
        $scope.init = function () {
            var fromLocStore = localStorage.getItem('timeSetLocStore');

            $scope.strategyFound = false;
            $scope.apiReturnCode = 200;
            $scope.isStrategyDataEmpty = false;
            $scope.hidePerformanceReportTab = false;
            $scope.strategyLoading =  true;
            $scope.strategies = {};
            $scope.resetVariables();
            $scope.selectedFilters = {};

            if (fromLocStore) {
                fromLocStore = JSON.parse(localStorage.getItem('timeSetLocStore'));
                $scope.selectedFilters.time_filter = fromLocStore;
            } else {
                $scope.selectedFilters.time_filter = 'life_time';
            }

            $scope.selectedFilters.campaign_default_kpi_type =  kpiSelectModel.getSelectedKpi();
            $scope.selectedFilters.kpi_type = 'cpm';
            $scope.selectedFilters2 = {};
            $scope.selectedFilters2.kpi_type = 'cpm';
            $scope.someDummyVarDeleteLater = kpiSelectModel.setSelectedKpi('cpm');
        };

        $scope.init();

        $scope.$on(constants.EVENT_TIMEPERIOD_CHANGED, function (event, strategy) {
            $scope.selectedFilters.time_filter = strategy;
            $scope.resetVariables();
            $scope.strategyChangeHandler();
        });

        $scope.$on(constants.EVENT_KPI_CHANGED, function () {
            if ($scope.selectedFilters === undefined){
                $scope.selectedFilters = {};
            }

            $scope.selectedFilters.kpi_type = kpiSelectModel.getSelectedKpi();
            $scope.selectedFilters2 = {};
            $scope.selectedFilters2.kpi_type = kpiSelectModel.getSelectedKpiAlt();
        });

        _customCtrl.filterDiscrepancyReport = function() {
            var fparams = featuresService.getFeatureParams();

            $scope.showDiscrepancyTab = fparams[0].discrepancy;

            if (!$scope.showDiscrepancyTab) {
                $scope.download_report = _.filter($scope.download_report, function (report) {
                    return report.name !== 'by_discrepancy';
                });
            }
        };

        // check the permission on load
        _customCtrl.filterDiscrepancyReport();

        $rootScope.$on('features', function() {
            _customCtrl.filterDiscrepancyReport();
        });



        $scope.$on('dropdown-arrow-clicked', function (event, args, sortorder) {
            if ($scope.selected_tab === 'byformats') {
                $scope.sortTypebyformats = args;
            } else if ($scope.selected_tab === 'bydaysofweek') {
                $scope.sortTypebydaysofweek = args;
            } else if ($scope.selected_tab === 'bycreatives') {
                $scope.sortTypeByCreatives = args;
            } else if ($scope.selected_tab === 'byadsizes') {
                $scope.sortTypeByAdSizes = args;
            } else if ($scope.selected_tab === 'byplatforms') {
                $scope.sortTypebyplatforms = args;
            } else if ($scope.selected_tab === 'byscreens') {
                $scope.sortTypeScreens = args;

                if (args === 'cpm') {
                    $scope.sortReverseForCostscpm = sortorder;
                } else if (args === 'cpc') {
                    $scope.sortReverseForCostscpc = sortorder;
                } else {
                    $scope.sortReverseForCostscpa = sortorder;
                }
            }

            $scope.sortType = args;
            $scope.sortTypeSubSort = 'tactic.' + args;
            $scope.sortReverse = sortorder;
            $scope.kpiDropdownActive = true;
        });

        $scope.removeKpiActive = function () {
            $('.kpi-dd-holder').removeClass('active');
            $('.dropdown_ul_text').removeClass('active');
            $('.drop_list li').removeClass('active').css('color', '#57606d');
            $('.direction_arrows div.kpi_arrow_sort.active').hide();
            $('.direction_arrows div.kpi_arrow_sort').removeClass('active');
        };

        $scope.specialSort = function (passedSortype) {
            $scope.sortType = passedSortype;
        };

        $scope.sortClassFunction = function (a,b,c) {
            var isActive = (a === b) ?  'active' : '',
                sortDirection = (c === true) ?  'sort_order_up' : 'sort_order_down';

            $('.direction_arrows div.kpi_arrow_sort.active').hide();

            if ($('.kpi-dd-holder').hasClass('active')) {
                $('.each_cost_col').removeClass('active');
                return sortDirection;
            } else{
                return isActive + ' ' + sortDirection;
            }
        };

        // Binding click event on tab and fetch strategy method.
        $(function () {
            var mainNavigation = $('.main_navigation');

            $('.each_tab').click(function (event) {
                var tab_id = $(this).attr('id').split('_tab');

                $rootScope.$broadcast(constants.TAB_CHANGED);

                if ($scope.kpiDropdownActive === true) {
                    $('.icon_text_holder').removeClass('active');
                }

                $scope.selected_tab = tab_id[0];
                $('.reports_tabs_holder').find('.active').removeClass('active');
                $(this).addClass('active');
                $('.reports_block').hide();
                $('#reports_' + tab_id[0] + '_block').show();
                $scope.strategyChangeHandler();
                event.preventDefault();
            });

            // hot fix for the enabling the active link in the reports dropdown
            mainNavigation.find('.header_tab_dropdown').removeClass('active_tab');
            mainNavigation.find('.reports_sub_menu_dd_holder').find('#performance').addClass('active_tab');
            // end of hot fix for the enabling the active link in the reports dropdown
        });

        $scope.performanceIconUrl = function (iconName) {
            return '/images/platform_favicons/' + ((!iconName || iconName === 'Unknown') ?
                    'platform_logo.png' : iconName.toLowerCase().replace(/ /g, '_') + '.png');
        };
    });
});
