var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('InventoryController', function ($scope, $http, $window, apiPaths,kpiSelectModel, requestCanceller, campaignSelectModel, strategySelectModel , inventoryService, columnline, utils, dataService, domainReports, constants, timePeriodModel, loginModel, analytics) {

        //Hot fix to show the campaign tab selected
        $(".main_navigation").find('.active').removeClass('active').end().find('#reports_nav_link').addClass('active');

        //Default Values

        $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign() ;
        $scope.selectedStrategy = strategySelectModel.getSelectedStrategy();

        $scope.api_return_code = 200;

        $scope.getMessageForDataNotAvailable = function (dataSetType) {

            if ($scope.api_return_code == 404 || $scope.api_return_code >=500) {
                return constants.MSG_UNKNOWN_ERROR_OCCURED;
            }
            if ( campaignSelectModel.durationLeft() == 'Yet to start')
                return constants.MSG_CAMPAIGN_YET_TO_START;
            else if (campaignSelectModel.daysSinceEnded() > 1000)
                return constants.MSG_CAMPAIGN_VERY_OLD;
            else if ( $scope.selectedCampaign.kpi =='null')
                return constants.MSG_CAMPAIGN_KPI_NOT_SET;
            else if (dataSetType == 'inventory' && campaignSelectModel.durationLeft() !== 'Ended')
                return constants.MSG_METRICS_NOT_TRACKED;
            else
                return constants.MSG_DATA_NOT_AVAILABLE;
        };
      //  $scope.selected_filters = domainReports.getDurationKpi();

        $scope.filters = domainReports.getReportsDropDowns();

        $scope.selected_filters_tb = '0';
        $scope.selected_filters_tab = 'categories';
        $scope.strategyLoading =  true;

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
            $scope.strategyFound = false;
            $scope.strategyTableData = [];
            $scope.strategyTable.topPerformance = [];
            $scope.strategyTable.bottomPerformance = [];
            $scope.tacticList.tacticList = [];
            $scope.tacticList.topPerformance = [];
            $scope.tacticList.bottomPerformance = [];

            $scope.strategyBusy = false;
            $scope.tacticBusy = false;
            $scope.isStrategyDropDownShow = true;

            $scope.selected_filters = {};
            $scope.selected_filters.time_filter = 'life_time'; //
            $scope.selected_filters.campaign_default_kpi_type = $scope.selectedCampaign.kpi.toLowerCase() ;
            $scope.selected_filters.kpi_type = kpiSelectModel.getSelectedKpi();

        };
        $scope.init();

        //This function is called for tactics Table data
        $scope.getTacticList = function (param) {
            $scope.tacticBusy = true;

            var url = inventoryService.getAllTacticDomainData(param);
            var canceller =  requestCanceller.initCanceller(constants.INVENTORY_TACTC_CANCELLER );
            var errorHandler =  function() {
                var bottomChartObj = false;
                var topChartObj = false;
                $scope.tacticBusy = false;
                $scope.inventoryChart = false;
            };
            return dataService.fetchCancelable(url, canceller, function(result) {
            //inventoryService.getAllTacticDomainData(param).then(function (result) {

                if (result.status === "OK" || result.status === "success") {

                    if (result.data.data[0] !== 'undefined' ) {

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

                                var topChartObj = true, bottomChartObj = true;
                                if (topPerformance.length > 4) {
                                    topChartObj = columnline.highChart(topPerformance, $scope.selected_filters.kpi_type);
                                }
                                if (topChartObj === undefined || topPerformance.length == 0) {
                                    var topChartObj = false;
                                }
                                //For Bottom Chart
                                if (bottomPerformance.length > 4) {
                                    bottomChartObj = columnline.highChart(bottomPerformance, $scope.selected_filters.kpi_type);
                                }
                                if (topChartObj === undefined || bottomPerformance.length == 0) {
                                    var bottomChartObj = false;
                                }
                                $scope.tacticList.topPerformance.push({tacticId: $scope.tacticList.tacticList[t].id, name: $scope.tacticList.tacticList[t].name, data: topPerformance, chart: topChartObj });
                                $scope.tacticList.bottomPerformance.push({tacticId: $scope.tacticList.tacticList[t].id, name: $scope.tacticList.tacticList[t].name, data: bottomPerformance, chart: bottomChartObj });

                            }
                        }
                    } else { // We get empty data response.
                        errorHandler();
                    }
                } else { // Call is failed.
                    errorHandler();
                }
            }, errorHandler);
        };


        $scope.$on(constants.EVENT_CAMPAIGN_CHANGED , function(event,campaign){
            $scope.init();

            //update the selected Campaign
            $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign() ;
            $scope.callBackCampaignsSuccess();

            //TODO : NOt sure what is following check. Check if we can remove it

            $scope.inventoryChart = true;
            if ($scope.tacticList[$scope.tacticList.show][0]) {
                $scope.tacticList[$scope.tacticList.show][0].chart = true;
            }

        });

        $scope.$on(constants.EVENT_STRATEGY_CHANGED , function(event,strategy){
            $scope.selectedStrategy.id =  strategySelectModel.getSelectedStrategy().id ;
            $scope.selectedStrategy.name = strategySelectModel.getSelectedStrategy().name ;
            $scope.strategyHeading = Number($scope.selectedStrategy.id) === 0 ? 'Campaign total' : 'Strategy total';
            $scope.callBackStrategyChange();
        });



        $scope.inventoryChart = true;

        //Function called to draw the Strategy chart
        $scope.getStrategyChart = function (param) {
            $scope.strategyBusy = true;
            var url = inventoryService.getStrategyDomainData(param);
            var canceller =  requestCanceller.initCanceller(constants.INVENTORY_STRATEGY_CANCELLER);
            var errorHandler =  function(result) {
                if (result && result.data)
                    $scope.api_return_code = result.data.status;

                $scope.inventoryChart = false;
                $scope.strategyBusy = false;
                $scope.tacticBusy = false;
                $scope.strategyTableData = [];
                $scope.strategyTable.topPerformance = [];
                $scope.strategyTable.bottomPerformance = [];
                $scope.tacticList.tacticList = [];
                $scope.tacticList.topPerformance = [];
                $scope.tacticList.bottomPerformance = [];
            };
            $scope.api_return_code = 200;
            return dataService.fetchCancelable(url, canceller, function(result){
                if (result.status === "OK" || result.status === "success") {
                    $scope.strategyTable.topPerformance = [], $scope.strategyTable.bottomPerformance = [];

                    if ((result.data.data[0] !== undefined) && ((result.data.data[0].inv_metrics !== null || result.data.data[0].inv_metrics !== undefined) && result.data.data[0].inv_metrics.length > 0 ) ) {
                        var resultTableData = result.data.data[0].inv_metrics;

                        // First confirm that the current selected tab and the tab for which we got data response are same. Then only process the data.
                        if (param.domain.toLowerCase() === $scope.selected_filters_tab.toLowerCase()) {

                            $scope.strategyBusy = false;
                            // if we get valid inventroy data for strategy then only we need to make call to get tactic data

                                // As we got strategy data ,first do the call for tactics data
                                if(Number($scope.selectedStrategy.id)) {
                                    $scope.getTacticList({
                                        campaign_id: $scope.selectedCampaign.id,
                                        strategyId: Number($scope.selectedStrategy.id),
                                        kpi_type: $scope.selected_filters.kpi_type,
                                        domain: $scope.selected_filters_tab,
                                        time_filter: $scope.selected_filters.time_filter
                                    });

                                }
                                //Default show the top performance strategies
                                if ($scope.strategyTable.show == 'Top') {
                                    $scope.strategyTableData = $scope.strategyTable.topPerformance; //.slice(0, 5);
                                } else {
                                    $scope.strategyTableData = $scope.strategyTable.bottomPerformance; //.slice(0, 5);
                                }

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
                                $scope.inventoryChart = columnline.highChart($scope.strategyTableData, $scope.selected_filters.kpi_type);
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
                        errorHandler();

                    }
                } // Means no strategy data found with API response 404
                else {
                    errorHandler();
                }
            }, errorHandler);
        };

        //Function called when the user clicks on the 'Top performance' button
        //TODO: toggle is not correct. (1). it will toggle for strategyTable + tactic table.
        // TODO: (2).for both, strategy and tactic, it will check if resultTableData is empty, then show "Data not found" message.
        $scope.showPerformance = function (flag) {
            $scope.inventoryChart = true;

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
                    $scope.inventoryChart = columnline.highChart($scope.strategyTableData, $scope.selected_filters.kpi_type);
                } else {
                    $scope.inventoryChart = false;
                }
                // $scope.getTacticList({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, domain: $scope.selected_filters.domain, time_filter: $scope.selected_filters.time_filter });
                analytics.track(loginModel.getUserRole(), constants.GA_INVENTORY_TAB_PERFORMANCE, flag.toLowerCase() + '_performance', loginModel.getLoginName());

        };

        //Function to expand and collide tactic accordian.
        $scope.clickTactic = function (id) {
            $('#tactic_' + id + '_body').toggle();
        };

        //Function is called from startegylist directive
        $scope.callBackStrategyChange = function () {

            $scope.strategyTableData = [];
            $scope.strategyTable.topPerformance = [];
            $scope.strategyTable.bottomPerformance = [];
            $scope.tacticList.tacticList = [];
            $scope.tacticList.topPerformance = [];
            $scope.tacticList.bottomPerformance = [];

            if($scope.selectedStrategy.id == -99 ||$scope.selectedStrategy.id == -1  ){
                $scope.strategyFound = false ;
            } else {
                $scope.strategyFound = true;
                $scope.getStrategyChart({
                    campaign_id: $scope.selectedCampaign.id,
                    strategyId: Number($scope.selectedStrategy.id),
                    kpi_type: $scope.selected_filters.kpi_type,
                    domain: $scope.selected_filters_tab,
                    time_filter: $scope.selected_filters.time_filter
                });
                analytics.track(loginModel.getUserRole(), constants.GA_USER_STRATEGY_SELECTION, $scope.selectedStrategy.name, loginModel.getLoginName());
            }
            $scope.inventoryBusy = false ;
        };

        $scope.callBackCampaignsSuccess = function () {
            var urlPath = apiPaths.apiSerivicesUrl + '/campaigns/' + $scope.selectedCampaign.id + '/inventory/';
            $scope.download_urls = {
                category: urlPath + 'categories/download?date_filter=' + $scope.selected_filters.time_filter,
                domain: urlPath + 'parentdomains/download?date_filter=' + $scope.selected_filters.time_filter,
                fullURL: urlPath + 'fulldomains/download?date_filter=' + $scope.selected_filters.time_filter
            };
        };

        $scope.$on(constants.EVENT_KPI_CHANGED, function(e) {
            $scope.selected_filters.kpi_type = kpiSelectModel.getSelectedKpi();
            //$scope.$apply();
            //$scope.callBackStrategyChange();
        });


        //Function called when the user clicks on the category tabs
        $('#category_change').click(function (e) {
            $scope.inventoryChart = true;
            $scope.strategyBusy = true;
            $scope.tacticBusy = false;
            $scope.selected_filters_tab = $(e.target).attr('_key');
            $(".inventory_tab_active").removeClass("inventory_tab_active");
            $(e.target).parent().addClass("inventory_tab_active");
            $scope.$apply();
            $scope.callBackStrategyChange();
            analytics.track(loginModel.getUserRole(), constants.GA_INVENTORY_TAB_USER_SELECTION, $scope.selected_filters_tab, loginModel.getLoginName());
        });

        $scope.$on(constants.EVENT_TIMEPERIOD_CHANGED, function (event) {
            $scope.callBackKpiDurationChange('duration');
        });


        $scope.downloadInventoryReport = function(report_url, report_name) {
            if (!loginModel.cookieExists())
                loginModel.checkCookieExpiry();
            else {
                $scope.invReportDownloadBusy = true;
                dataService.downloadFile(report_url).then(function (response) {
                    if (response.status === "success") {
                        $scope.invReportDownloadBusy = false;
                        saveAs(response.file, response.fileName);
                    } else if (response.status === "error") {
                        $scope.invReportDownloadBusy = false;
                    }
                });
                analytics.track(loginModel.getUserRole(), constants.GA_DOWNLOAD_REPORT, 'inventory_' + report_name + '_report', loginModel.getLoginName());
            }
        }

    });
}());