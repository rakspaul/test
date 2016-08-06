define(['angularAMD', 'reporting/kpiSelect/kpi_select_model', 'reporting/campaignSelect/campaign_select_model',
    'reporting/strategySelect/strategy_select_service', 'reporting/common/charts/column_line',
    'common/services/data_service', 'common/services/constants_service', 'reporting/timePeriod/time_period_model',
    'login/login_model', 'reporting/advertiser/advertiser_model', 'reporting/brands/brands_model',
    'common/services/url_service', 'reporting/kpiSelect/kpi_select_directive',
    'reporting/kpiSelect/kpi_select_controller', 'reporting/models/domain_reports',
    'common/services/vistoconfig_service', 'common/utils', 'reporting/strategySelect/strategy_select_directive',
    'reporting/strategySelect/strategy_select_controller', 'reporting/timePeriod/time_period_pick_directive'],
    function (angularAMD) {
    'use strict';

    angularAMD.controller('InventoryController', function ($scope, kpiSelectModel, campaignSelectModel,
                                                           strategySelectModel, columnline, dataService, constants,
                                                           timePeriodModel, loginModel, advertiserModel,
                                                           brandsModel, urlService, domainReports, vistoconfig, utils) {
        var inventoryWrapper =  {
            // Function called to draw the Strategy chart
            getStrategyChartData: function () {
                var inventoryQueryIdMapperWithAllAdsGroup = {
                        categories: 25,
                        domains: 27
                    },

                    inventoryQueryIdMapperWithSelectedAdsGroup = {
                        categories: 26,
                        domains: 28
                    },

                    dateFilter = timePeriodModel.getTimePeriod(timePeriodModel.timeData.selectedTimePeriod.key),

                    param = {
                        campaignId: $scope.selectedCampaign.id,
                        clientId: vistoconfig.getSelectedAccountId(),
                        advertiserId: vistoconfig.getSelectAdvertiserId(),
                        brandId: vistoconfig.getSelectedBrandId(),
                        dateFilter: dateFilter,
                        domain: $scope.selectedFilters_tab
                    },

                    url;

                $scope.strategyBusy = true;
                $scope.loadingFlag = true;
                $scope.apiReturnCode = 200;

                if (Number($scope.selectedStrategy.id) >= 0) {
                    param.queryId = inventoryQueryIdMapperWithSelectedAdsGroup[$scope.selectedFilters_tab];
                    param.strategyId = Number($scope.selectedStrategy.id);
                } else {
                    param.queryId = inventoryQueryIdMapperWithAllAdsGroup[$scope.selectedFilters_tab];
                }

                url = urlService.APIVistoCustomQuery(param);

                return dataService
                    .fetch(url)
                    .then(function (result) {
                        var adsTempData;

                        $scope.loadingFlag = false;
                        $scope.strategyLoading = false;

                        if (result.status === 'OK' || result.status === 'success') {
                            if ((result.data.data[0] !== undefined) &&
                                (result.data.data[0] !== null) &&
                                (result.data.data.length > 0 )) {
                                // First confirm that the current selected tab and the tab for which we got data
                                // response are same. Then only process the data.
                                if (param.domain.toLowerCase() === $scope.selectedFilters_tab.toLowerCase()) {
                                    $scope.strategyBusy = false;

                                    if (Number($scope.selectedStrategy.id) >= 0) {
                                        // strategy selected
                                        $scope.strategyTableData =
                                            _.filter(result.data.data, function (item) {
                                                return item.ad_id === -1 && item.ad_group_id === -1;
                                            });

                                        _.each($scope.strategyTableData, function (item) {
                                            item.kpi_type = $scope.selectedFilters.campaign_default_kpi_type;
                                        });

                                        adsTempData = _.filter(result.data.data, function (item) {
                                            return item.ad_id !== -1 && item.ad_group_id !== -1;
                                        });

                                        $scope.tacticListData = _.chain(adsTempData)
                                            .groupBy('ad_name')
                                            .map(function (value, key) {
                                                return {
                                                    // get first element of ad_id array
                                                    id: _.pluck(value, 'ad_id')[0],

                                                    // ad_name
                                                    name: key,

                                                    perf_metrics: value
                                                };
                                            })
                                            .value();
                                        inventoryWrapper.getTacticsChartData();
                                    } else {
                                        $scope.strategyTableData = result.data.data;

                                        _.each($scope.strategyTableData, function (item) {
                                            item.kpi_type = $scope.selectedFilters.campaign_default_kpi_type;
                                        });
                                    }
                                    if ($scope.strategyTableData.length > 0) {
                                        $scope.inventoryChart =
                                            columnline.highChart($scope.strategyTableData,
                                                $scope.selectedFilters.kpi_type);
                                    } else {
                                        $scope.inventoryChart = false;
                                    }
                                }

                                if ($scope.inventoryChart === undefined ||
                                    $scope.inventoryChart === null ||
                                    ($scope.strategyTableData === undefined ||
                                    $scope.strategyTableData === null) ||
                                    $scope.strategyTableData.length === 0) {
                                    $scope.inventoryChart = false;
                                }
                            } else {
                                // api call doesn't return result data or returns empty invetory metrics data.
                                inventoryWrapper.errorHandler();
                            }
                        } else {
                            // Means no strategy data found with API response 404
                            inventoryWrapper.errorHandler();
                        }
                    }, inventoryWrapper.errorHandler);
            },

            errorHandler: function (result) {
                if (result && result.data) {
                    $scope.apiReturnCode = result.data.status;
                }

                $scope.inventoryChart = false;
                $scope.strategyBusy = false;
                $scope.tacticList.tacticList = [];
                $scope.tacticList.topPerformance = [];
            },

            // This function is called for tactics Table data
            getTacticsChartData: function() {
                var topPerformance,
                    resultTableData,
                    topChartObj,
                    isGraphPlot,
                    t,
                    data;

                $scope.tacticList.tacticList = $scope.tacticListData;
                $scope.tacticList.topPerformance = [];

                for (t in  $scope.tacticList.tacticList) {
                    topPerformance = [];
                    resultTableData = $scope.tacticList.tacticList[t].perf_metrics;

                    for (data in resultTableData) {
                        topPerformance.push(resultTableData[data]);
                    }

                    topChartObj = true;
                    isGraphPlot = true;

                    // For Top Chart
                    if (topPerformance.length > 2) {
                        topChartObj = columnline.highChart(topPerformance, $scope.selectedFilters.kpi_type);
                    }

                    if (topChartObj === undefined || topPerformance.length === 0) {
                        topChartObj = false;
                    }

                    if (topPerformance.length === 1) {
                        topChartObj = false;
                        isGraphPlot = false;
                    }

                    $scope.tacticList.topPerformance.push({
                        tacticId: $scope.tacticList.tacticList[t].id,
                        name: $scope.tacticList.tacticList[t].name,
                        data: topPerformance,
                        chart: topChartObj,
                        graphRender: isGraphPlot
                    });
                }
            },

            // Function is called from strategyList directive
            callBackStrategyChange: function () {
                $scope.tacticList.tacticList = [];
                $scope.tacticList.topPerformance = [];

                if ($scope.selectedStrategy.id === -99) {
                    $scope.strategyFound = false;
                } else {
                    $scope.strategyFound = true;
                    inventoryWrapper.getStrategyChartData();
                }

                $scope.inventoryBusy = false;
            },

            // creating download report url
            createDownloadReportUrl: function () {
                $scope.download_report = [
                    {
                        url: '/reportBuilder/customQueryDownload',
                        query_id: 26,
                        label: 'Inventory Transparency by Site Category',
                        download_config_id: 1
                    },

                    {
                        url: '/reportBuilder/customQueryDownload',
                        query_id: 28,
                        label: 'Inventory Transparency by Domain',
                        download_config_id: 1
                    }
                ];
            },

            init: function () {
                var fromLocStore = localStorage.getItem('timeSetLocStore');

                $scope.strategyFound = false;
                $scope.strategyTableData = [];
                $scope.tacticList.tacticList = [];
                $scope.tacticList.topPerformance = [];
                $scope.strategyBusy = false;
                $scope.isStrategyDropDownShow = true;
                $scope.selectedFilters = {};

                if (fromLocStore) {
                    fromLocStore = JSON.parse(localStorage.getItem('timeSetLocStore'));
                    $scope.selectedFilters.time_filter = fromLocStore;
                } else {
                    $scope.selectedFilters.time_filter = 'life_time';
                }

                $scope.selectedFilters.campaign_default_kpi_type = $scope.selectedCampaign.kpi.toLowerCase();
                $scope.selectedFilters.kpi_type = kpiSelectModel.getSelectedKpi();
            }
        };

        $scope.textConstants = constants;

        // highlight the header menu - Dashboard, Campaigns, Reports
        domainReports.highlightHeaderMenu();

        // Default Values
        $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign();
        $scope.selectedStrategy = strategySelectModel.getSelectedStrategy();
        $scope.apiReturnCode = 200;
        $scope.inventoryChart = true;
        $scope.filters = domainReports.getReportsTabs();
        $scope.selectedFilters_tb = '0';
        $scope.selectedFilters_tab = 'categories';
        $scope.strategyLoading = true;

        $scope.strategyTable = {
            cssClass: 'top_perf_symbol'
        };

        $scope.tacticList = {
            tacticList: [],
            topPerformance: [],
            show: 'topPerformance'
        };

        // URL for download
        $scope.download_urls = {
            category: null,
            domain: null
        };

        $scope.getMessageForDataNotAvailable = function (campaign, dataSetType) {
            campaign = campaign || $scope.campaign;

            if (!campaign || campaign.id === -1) {
                return constants.MSG_DATA_NOT_AVAILABLE;
            } else if ($scope.apiReturnCode === 404 || $scope.apiReturnCode >= 500) {
                return constants.MSG_UNKNOWN_ERROR_OCCURED;
            } else if (campaignSelectModel.durationLeft() === 'Yet to start') {
                return utils.formatStringWithDate(constants.MSG_CAMPAIGN_YET_TO_START , campaign.startDate,constants.REPORTS_DATE_FORMAT);
            } else if (campaignSelectModel.daysSinceEnded() > 1000) {
                return constants.MSG_CAMPAIGN_VERY_OLD;
            } else if ($scope.selectedCampaign.kpi === 'null') {
                return constants.MSG_CAMPAIGN_KPI_NOT_SET;
            } else if (dataSetType === 'inventory') {
                return constants.MSG_METRICS_NOT_TRACKED;
            } else {
                return constants.MSG_DATA_NOT_AVAILABLE;
            }
        };

        $scope.$on(constants.EVENT_CAMPAIGN_CHANGED, function () {
            inventoryWrapper.init();

            // update the selected Campaign
            $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign();
            $scope.inventoryChart = true;

            if ($scope.tacticList[$scope.tacticList.show][0]) {
                $scope.tacticList[$scope.tacticList.show][0].chart = true;

            }

            // if no media plans will make strategyLoading false
            if($scope.selectedCampaign.id === -1) {
                $scope.strategyLoading = false;
            }
        });

        $scope.$watch('selectedCampaign', function () {
            inventoryWrapper.createDownloadReportUrl();
        });

        $scope.$on(constants.EVENT_STRATEGY_CHANGED, function () {
            $scope.selectedStrategy.id = strategySelectModel.getSelectedStrategy().id;
            $scope.selectedStrategy.name = strategySelectModel.getSelectedStrategy().name;

            $scope.strategyHeading = Number($scope.selectedStrategy.id) === 0 ?
                constants.MEDIA_PLAN_TOTAL : constants.LINE_ITME_TOTAL;

            inventoryWrapper.callBackStrategyChange();
        });

        $scope.$on(constants.EVENT_KPI_CHANGED, function (event, params) {
            $scope.selectedFilters.kpi_type = kpiSelectModel.getSelectedKpi();

            if (params.event_type === 'clicked') {
                inventoryWrapper.callBackStrategyChange();
            }
        });

        $scope.$on(constants.EVENT_TIMEPERIOD_CHANGED, function (event, strategy) {
            $scope.selectedFilters.time_filter = strategy;
            inventoryWrapper.callBackStrategyChange();
            inventoryWrapper.createDownloadReportUrl();
        });

        // Function to expand and collide tactic accordian.
        $scope.clickTactic = function (id) {
            $('#tactic_' + id + '_body').toggle();
        };

        $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign();
        inventoryWrapper.init();
        inventoryWrapper.callBackStrategyChange();

        $(function() {
            // hot fix for the enabling the active link in the reports dropdown
            setTimeout(function () {
                var mainNavigation =  $('.main_navigation');

                mainNavigation.find('.header_tab_dropdown').removeClass('active_tab');
                mainNavigation.find('.reports_sub_menu_dd_holder').find('#inventory').addClass('active_tab');
            }, 200);
            // end of hot fix for the enabling the active link in the reports dropdown

            // Function called when the user clicks on the category tabs
            $('#category_change').click(function (e) {
                $scope.inventoryChart = true;
                $scope.strategyBusy = true;
                $scope.selectedFilters_tab = $(e.target).attr('_key');
                $('.inventory_tab_active').removeClass('inventory_tab_active');
                $(e.target).parent().addClass('inventory_tab_active');
                $scope.$apply();
                inventoryWrapper.callBackStrategyChange();
            });
        });
    });
});
