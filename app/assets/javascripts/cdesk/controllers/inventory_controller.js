var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('InventoryController', function ($scope, $http, $window, apiPaths, inventoryService, columnline, utils, domainReports, dataTransferService, constants, timePeriodModel, loginModel, analytics) {

        //Hot fix to show the campaign tab selected
        $(".main_navigation").find('.active').removeClass('active').end().find('#reports_nav_link').addClass('active');

        //Default Values

        $scope.selectedCampaign = domainReports.intValues()['campaign'];
        $scope.selectedStrategy = domainReports.intValues()['strategy'];

        $scope.selected_filters = domainReports.getDurationKpi();

        $scope.filters = domainReports.getReportsDropDowns();

        $scope.selected_filters_tb = '0';
        $scope.selected_filters_tab = 'categories';

        $scope.strategyTable = {
            topPerformance: [],
            bottomPerformance: [],
            show: 'Top',
            cssClass: 'top_perf_symbol'
        };

        $scope.tacticList = {
            tacticList: [],
            topPerformance: [],
            bottomPerformance: [],
            show: 'topPerformance'
        };

        //URL for download
        $scope.download_urls = {
            category: null,
            domain: null,
            fullURL: null
        };

        $scope.init = function () {
            $scope.strategies = {};
            $scope.strategyFound = false;
            $scope.strategyTableData = [];
            $scope.strategyTable.topPerformance = [];
            $scope.strategyTable.bottomPerformance = [];
            $scope.tacticList.tacticList = [];
            $scope.tacticList.topPerformance = [];
            $scope.tacticList.bottomPerformance = [];

            $scope.strategyBusy = false;
            $scope.tacticBusy = false;

        };
        $scope.init();

        /*Strategy List Functions*/
        $scope.updateStrategyObjects = function (strategy) {
            $scope.strategies = strategy;
            if ($scope.strategies !== 'undefined' && $scope.strategies.length > 0) {
                //If a different campaign is selected, then load the first strategy data
                var strategyObj = domainReports.loadFirstStrategy($scope.strategies[0].id, $scope.strategies[0].name);
                $scope.selectedStrategy.id = strategyObj.id;
                $scope.selectedStrategy.name = strategyObj.name;
                $scope.strategyFound = true;
                //Call the Apis to load the Strategy Chart and the Tactics chart
                $scope.getStrategyChart({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, domain: $scope.selected_filters_tab, time_filter: $scope.selected_filters.time_filter });
                // $scope.getTacticList({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, domain: $scope.selected_filters.domain, time_filter: $scope.selected_filters.time_filter});
            } else { //  means empty strategy list
                $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
                $scope.strategyFound = false;
                $scope.inventoryChart = false;
                $scope.strategies = {}; // if No Strategy then clear the strategy list.

            }
        };

        //Calling the Strategy object based on the campaignId
        $scope.strategylist = function (campaignId) {
            $scope.selectedStrategy.name = "Loading...";
            domainReports.getCampaignStrategyList(campaignId).then(function (result) {
                if (result.status == 'success') {
                    var strategy = result.data.data;
                    $scope.updateStrategyObjects(strategy);
                } else {
                    $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
                    $scope.strategies = {}; // clear the old strategy list
                }
            });
        };


        //This function is called for tactics Table data
        $scope.getTacticList = function (param) {
            $scope.tacticBusy = true;
            inventoryService.getAllTacticDomainData(param).then(function (result) {

                if (result.status === "OK" || result.status === "success") {

                    if (result.data.data[0] !== 'undefined') {

                        if (param.domain.toLowerCase() === $scope.selected_filters_tab.toLowerCase()) {

                            $scope.tacticList.tacticList = result.data.data[0].tactics;
                            $scope.tacticBusy = false;
                            $scope.tacticList.topPerformance = [], $scope.tacticList.bottomPerformance = [];
                            for (var t in  $scope.tacticList.tacticList) {
                                var topPerformance = [], bottomPerformance = [];
                                var resultTableData = $scope.tacticList.tacticList[t].inv_metrics;

                                $scope.tacticBusy = false;

                                for (var data in resultTableData) {
                                    if (resultTableData[data].tb === 0) {
                                        topPerformance.push(resultTableData[data]);
                                    } else if (resultTableData[data].tb === 1) {
                                        bottomPerformance.push(resultTableData[data]);
                                    }
                                }
//                        topPerformance = topPerformance.slice(0, 5);
//                        bottomPerformance = bottomPerformance.slice(0, 5);
                                var topChartObj = true, bottomChartObj = true;
                                if (topPerformance.length > 4) {
                                    topChartObj = columnline.highChart(topPerformance, $scope.selected_filters.kpi_type_text);
                                }
                                if (topChartObj === undefined || topPerformance.length == 0) {
                                    var topChartObj = false;
                                }
                                //For Bottom Chart
                                if (bottomPerformance.length > 4) {
                                    bottomChartObj = columnline.highChart(bottomPerformance, $scope.selected_filters.kpi_type_text);
                                }
                                if (topChartObj === undefined || bottomPerformance.length == 0) {
                                    var bottomChartObj = false;
                                }
                                $scope.tacticList.topPerformance.push({tacticId: $scope.tacticList.tacticList[t].id, name: $scope.tacticList.tacticList[t].name, data: topPerformance, chart: topChartObj });
                                $scope.tacticList.bottomPerformance.push({tacticId: $scope.tacticList.tacticList[t].id, name: $scope.tacticList.tacticList[t].name, data: bottomPerformance, chart: bottomChartObj });

                            }
                        }
                    } else { // We get empty data response.
                        $scope.tacticBusy = false;
                        $scope.inventoryChart = false;
                    }
                } else { // Call is failed.
                    var bottomChartObj = false;
                    var topChartObj = false;
                    $scope.tacticBusy = false;
                    $scope.inventoryChart = false;
                }
            });
        };


        $scope.inventoryChart = true;

        //Function called to draw the Strategy chart
        $scope.getStrategyChart = function (param) {
            $scope.strategyBusy = true;

            inventoryService.getStrategyDomainData(param).then(function (result) {
                if (result.status === "OK" || result.status === "success") {
                    $scope.strategyTable.topPerformance = [], $scope.strategyTable.bottomPerformance = [];

                    if ((result.data.data[0] !== undefined) && ((result.data.data[0].inv_metrics !== null || result.data.data[0].inv_metrics !== undefined) && result.data.data[0].inv_metrics.length > 0 ) ) {
                        var resultTableData = result.data.data[0].inv_metrics;

                                // First confirm that the current selected tab and the tab for which we got data response are same. Then only process the data.
                                if (param.domain.toLowerCase() === $scope.selected_filters_tab.toLowerCase()) {

                            $scope.strategyBusy = false;
                            // if we get valid inventroy data for strategy then only we need to make call to get tactic data

                                // As we got strategy data ,first do the call for tactics data
                                $scope.getTacticList({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, domain: $scope.selected_filters_tab, time_filter: $scope.selected_filters.time_filter });

                                // Now process obtained straregy data for graph and table showing.
                                for (var data in resultTableData) {
                                    if (resultTableData[data].tb === 0) {
                                        $scope.strategyTable.topPerformance.push(resultTableData[data]);
                                    } else {
                                        $scope.strategyTable.bottomPerformance.push(resultTableData[data]);
                                    }
                                }

                                //Default show the top performance strategies
                                if ($scope.strategyTable.show == 'Top') {
                                    $scope.strategyTableData = $scope.strategyTable.topPerformance; //.slice(0, 5);
                                } else {
                                    $scope.strategyTableData = $scope.strategyTable.bottomPerformance; //.slice(0, 5);
                                }

                                if ($scope.strategyTableData.length > 0) {
                                    $scope.inventoryChart = columnline.highChart($scope.strategyTableData, $scope.selected_filters.kpi_type_text);
                                } else {
                                    $scope.inventoryChart = false;
                                }

                            }

                            // draw tactic graph only when strategy section got valid data.
                            //   $scope.getTacticList({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, domain: $scope.selected_filters.domain, time_filter: $scope.selected_filters.time_filter });
                            if ($scope.inventoryChart === undefined || $scope.inventoryChart === null || (resultTableData === undefined || resultTableData === null) || resultTableData.length == 0) {
                                $scope.inventoryChart = false;
                                $scope.tacticBusy = false ;
                                // we are making $scope.tacticBusy = false here because if no data found for a particular kpi and then we change tab then for that also
                                // data is not found but tactic loader was still true.
                            }
                    }
                    else { //api call doesn't return result data or returns empty invetory metrics data.
                        $scope.inventoryChart = false;
                        $scope.strategyBusy = false;
                        $scope.tacticBusy = false;
                        $scope.strategyTableData = [];
                        $scope.strategyTable.topPerformance = [];
                        $scope.strategyTable.bottomPerformance = [];
                        $scope.tacticList.tacticList = [];
                        $scope.tacticList.topPerformance = [];
                        $scope.tacticList.bottomPerformance = [];

                    }
                } // Means no strategy data found with API response 404
                else {
                    $scope.inventoryChart = false;
                    $scope.strategyBusy = false;
                    $scope.tacticBusy = false;
                    $scope.strategyTableData = [];
                    $scope.strategyTable.topPerformance = [];
                    $scope.strategyTable.bottomPerformance = [];
                    $scope.tacticList.tacticList = [];
                    $scope.tacticList.topPerformance = [];
                    $scope.tacticList.bottomPerformance = [];
                }
            });
        };

        //Function called when the user clicks on the 'Top performance' button
        //TODO: toggle is not correct. (1). it will toggle for strategyTable + tactic table.
        // TODO: (2).for both, strategy and tactic, it will check if resultTableData is empty, then show "Data not found" message.
        $scope.showPerformance = function (flag) {
            $scope.inventoryChart = true;
            if (domainReports.checkStatus($scope.selectedCampaign.name, $scope.selectedStrategy.name)) {
                if (flag === 'Top') {
                    $scope.strategyTableData = $scope.strategyTable.bottomPerformance; //.slice(0, 5);
                    $scope.strategyTable.show = 'Bottom';
                    $scope.strategyTable.cssClass = '';
                    $scope.tacticList.show = 'bottomPerformance';
                } else {
                    $scope.strategyTableData = $scope.strategyTable.topPerformance; //.slice(0, 5);
                    $scope.strategyTable.show = 'Top';
                    $scope.strategyTable.cssClass = 'top_perf_symbol';
                    $scope.tacticList.show = 'topPerformance';
                }
                if ($scope.strategyTableData.length > 0) {
                    $scope.inventoryChart = columnline.highChart($scope.strategyTableData, $scope.selected_filters.kpi_type_text);
                } else {
                    $scope.inventoryChart = false;
                }
                // $scope.getTacticList({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, domain: $scope.selected_filters.domain, time_filter: $scope.selected_filters.time_filter });
                analytics.track(loginModel.getUserRole(), constants.GA_INVENTORY_TAB_PERFORMANCE, flag.toLowerCase() + '_performance', loginModel.getLoginName());
            }
        };

        //Function to expand and collide tactic accordian.
        $scope.clickTactic = function (id) {
            $('#tactic_' + id + '_body').toggle();
        };

        //Function is called from startegylist directive
        $scope.callBackStrategyChange = function () {
            $scope.getStrategyChart({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, domain: $scope.selected_filters_tab, time_filter: $scope.selected_filters.time_filter });
            analytics.track(loginModel.getUserRole(), constants.GA_USER_STRATEGY_SELECTION, $scope.selectedStrategy.name, loginModel.getLoginName());
        };

        $scope.callBackCampaignsSuccess = function () {
            var urlPath = apiPaths.apiSerivicesUrl + '/campaigns/' + $scope.selectedCampaign.id + '/inventory/';
            $scope.download_urls = {
                category: urlPath + 'categories/download?date_filter=' + $scope.selected_filters.time_filter,
                domain: urlPath + 'parentdomains/download?date_filter=' + $scope.selected_filters.time_filter,
                fullURL: urlPath + 'fulldomains/download?date_filter=' + $scope.selected_filters.time_filter
            };
        };

        $scope.callBackCampaignsFailure = function () {
            $scope.strategyFound = false;
        };
        $scope.callBackCampaignChange = function () {
            $scope.init();
            $scope.selectedStrategy = domainReports.getDefaultValues()['strategy'];
            if ($scope.selectedCampaign.id !== -1) {
                $scope.strategylist($scope.selectedCampaign.id);
                $scope.callBackCampaignsSuccess();
            }
            else {
                $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
                $scope.strategyFound = false;
                $scope.strategies = {}; // if No Strategy then clear the strategy list.
            }
            $scope.inventoryChart = true;
            if ($scope.tacticList[$scope.tacticList.show][0]) {
                $scope.tacticList[$scope.tacticList.show][0].chart = true;
            }
        };

        //This function is called from the directive, onchange of the dropdown
        $scope.callBackKpiDurationChange = function (kpiType) {
            if (kpiType == 'duration') {
                var urlPath = apiPaths.apiSerivicesUrl + '/campaigns/' + $scope.selectedCampaign.id + '/inventory/';
                $scope.download_urls = {
                    category: urlPath + 'categories/download?date_filter=' + $scope.selected_filters.time_filter,
                    domain: urlPath + 'parentdomains/download?date_filter=' + $scope.selected_filters.time_filter,
                    fullURL: urlPath + 'fulldomains/download?date_filter=' + $scope.selected_filters.time_filter
                };
                dataTransferService.updateExistingStorageObjects({'filterDurationType': $scope.selected_filters.time_filter, 'filterDurationValue': $scope.selected_filters.time_filter_text});
            } else {
                //cleaning up the old data

                $scope.strategyTable.topPerformance = [];
                $scope.strategyTable.bottomPerformance = [];
                $scope.strategyTableData = [];

                $scope.tacticList.tacticList = [];
                $scope.tacticList.topPerformance = [];
                $scope.tacticList.bottomPerformance = [];
                dataTransferService.updateExistingStorageObjects({'filterKpiType': $scope.selected_filters.kpi_type, 'filterKpiValue': $scope.selected_filters.kpi_type_text});
            }
            $scope.getStrategyChart({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, domain: $scope.selected_filters_tab, time_filter: $scope.selected_filters.time_filter });

            $scope.$apply();
            analytics.track(loginModel.getUserRole(), constants.GA_INVENTORY_TAB_METRIC_SELECTED, $scope.selected_filters.kpi_type_text, loginModel.getLoginName());
        };

        //Function called when the user clicks on the category tabs
        $('#category_change').click(function (e) {
            $scope.inventoryChart = true;
            $scope.strategyBusy = true;
            $scope.tacticBusy = true;
            if (domainReports.checkStatus($scope.selectedCampaign.name, $scope.selectedStrategy.name)) {
                $scope.selected_filters_tab = $(e.target).attr('_key');
                $(".inventory_tab_active").removeClass("inventory_tab_active");
                $(e.target).parent().addClass("inventory_tab_active");
                $scope.$apply();
                $scope.getStrategyChart({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, domain: $scope.selected_filters_tab, time_filter: $scope.selected_filters.time_filter });
                analytics.track(loginModel.getUserRole(), constants.GA_INVENTORY_TAB_USER_SELECTION, $scope.selected_filters_tab, loginModel.getLoginName());
            }
        });

        $scope.$on(constants.EVENT_TIMEPERIOD_CHANGED, function (event) {
            $scope.callBackKpiDurationChange('duration');
        });

        $scope.$on(constants.NAVIGATION_FROM_CAMPAIGNS, function() {

            if ($scope.selectedCampaign.id !== -1) {
                $scope.strategylist($scope.selectedCampaign.id);
                $scope.callBackCampaignsSuccess();
            } else {
                $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
                $scope.strategyFound = false ;
                $scope.strategies = {} ; // if No Strategy then clear the strategy list.

            }

        });

        $scope.downloadInventoryReport = function(report_url, report_name) {
            $window.location.href = report_url;
            analytics.track(loginModel.getUserRole(), constants.GA_DOWNLOAD_REPORT, 'inventory_' + report_name + '_report', loginModel.getLoginName());
        }

    });
}());