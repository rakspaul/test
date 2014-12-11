var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('InventoryController', function ($scope, $http, apiPaths, inventoryService, columnline, utils, domainReports, dataTransferService) {

        //Hot fix to show the campaign tab selected
        $("ul.nav:first").find('.active').removeClass('active').end().find('li:contains(Reports)').addClass('active');

        //Default Values
        $scope.selectedCampaign = domainReports.getDefaultValues();

        $scope.selectedStrategy = domainReports.getDefaultValues();

        $scope.selected_filters = domainReports.getDurationKpi();
        $scope.selected_filters.tb = '1';
        $scope.selected_filters.domain = 'categories';

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

        $scope.filters = domainReports.getReportsDropDowns();
        $scope.strategyFound = false;


       

        //URL for download
        $scope.download_url = apiPaths.apiSerivicesUrl + '/campaigns/' + $scope.selectedCampaign.id + '/inventory/' + $scope.selected_filters.domain + '/download?date_filter=' + $scope.selected_filters.time_filter;




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
                $scope.getStrategyChart({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, domain: $scope.selected_filters.domain, time_filter: $scope.selected_filters.time_filter });
                $scope.getTacticList({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, domain: $scope.selected_filters.domain, time_filter: $scope.selected_filters.time_filter});
            } else { //  means empty strategy list
                $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
                $scope.strategyFound = false;
                $scope.inventoryChart = false;

            }
        };

        //Calling the Strategy object based on the campaignId
        $scope.strategylist = function (campaignId) {
            $scope.selectedStrategy.name = "Loading...";
            if (dataTransferService.getCampaignStrategyList(campaignId) === false) {
                domainReports.getCampaignStrategyList(campaignId).then(function (result) {
                    if (result.status == 'success') {
                        var strategy = result.data.data;
                        dataTransferService.setCampaignStrategyList(campaignId, strategy);
                        $scope.updateStrategyObjects(strategy);
                    } else {
                        $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
                    }
                });
            } else {
                $scope.updateStrategyObjects(domainReports.getCampaignStrategyList(campaignId));
            }
        };


        //This function is called for tactics Table data
        $scope.getTacticList = function (param) {
            inventoryService.getAllTacticDomainData(param).then(function (result) {
                if (result.data.data[0] !== 'undefined') {
                    $scope.tacticList.tacticList = result.data.data[0].tactics;
                    $scope.tacticList.topPerformance = [], $scope.tacticList.bottomPerformance = [];
                    for (var t in  $scope.tacticList.tacticList) {
                        var topPerformance = [], bottomPerformance = [];
                        var resultTableData = $scope.tacticList.tacticList[t].inv_metrics;
                        for (var data in resultTableData) {
                            if (resultTableData[data].tb === 1) {
                                topPerformance.push(resultTableData[data]);
                            } else if (resultTableData[data].tb === 0) {
                                bottomPerformance.push(resultTableData[data]);
                            }
                        }
                        bottomPerformance.sort(sortNumber);

                        topPerformance = topPerformance.slice(0, 5);
                        bottomPerformance = bottomPerformance.slice(0, 5);
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
                else {
                    var bottomChartObj = false;
                    var topChartObj = false;
                    $scope.inventoryChart = false;
                }
            });
        };

        var sortNumber = function (a, b) {
            return a.kpi_value - b.kpi_value;
        };

        $scope.inventoryChart = true;

        //Function called to draw the Strategy chart
        $scope.getStrategyChart = function (param) {
            inventoryService.getStrategyDomainData(param).then(function (result) {
                if (result.status === "OK" || result.status === "success") {
                    $scope.strategyTable.topPerformance = [], $scope.strategyTable.bottomPerformance = [];

                    if (result.data.data[0] !== undefined) {
                        var resultTableData = result.data.data[0].inv_metrics;
                        for (var data in resultTableData) {
                            if (resultTableData[data].tb === 1) {
                                $scope.strategyTable.topPerformance.push(resultTableData[data]);

                            } else {
                                $scope.strategyTable.bottomPerformance.push(resultTableData[data]);
                            }
                        }

                        $scope.strategyTable.bottomPerformance.sort(sortNumber);

                        //Default show the top performance strategies
                        if ($scope.strategyTable.show == 'Top') {
                            $scope.strategyTableData = $scope.strategyTable.topPerformance.slice(0, 5);
                        } else {
                            $scope.strategyTableData = $scope.strategyTable.bottomPerformance.slice(0, 5);
                        }
                        if ($scope.strategyTableData.length > 0) {
                            $scope.inventoryChart = columnline.highChart($scope.strategyTableData, $scope.selected_filters.kpi_type);
                        } else {
                            $scope.inventoryChart = false;
                        }
                        // draw tactic graph only when strategy section got valid data.
                        //   $scope.getTacticList({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, domain: $scope.selected_filters.domain, time_filter: $scope.selected_filters.time_filter });
                        if ($scope.inventoryChart === undefined || $scope.inventoryChart === null || resultTableData === undefined || resultTableData.length == 0) {
                            $scope.inventoryChart = false;
                        }
                    }
                    else {
                        $scope.inventoryChart = false;
                    }
                } // Means no strategy data found
                else {
                    $scope.inventoryChart = false;
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
                    $scope.strategyTableData = $scope.strategyTable.bottomPerformance.slice(0, 5);
                    $scope.strategyTable.show = 'Bottom';
                    $scope.strategyTable.cssClass = '';
                    $scope.tacticList.show = 'bottomPerformance';
                } else {
                    $scope.strategyTableData = $scope.strategyTable.topPerformance.slice(0, 5);
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
            }
        };

        //Function to expand and collide tactic accordian.
        $scope.clickTactic = function (id) {
            $('#tactic_' + id + '_body').toggle();
        };

        //Function is called from startegylist directive
        $scope.callBackStrategyChange = function () {
            $scope.getStrategyChart({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, domain: $scope.selected_filters.domain, time_filter: $scope.selected_filters.time_filter });
            $scope.getTacticList({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, domain: $scope.selected_filters.domain, time_filter: $scope.selected_filters.time_filter });
        };

        $scope.callBackCampaignsSuccess = function() {
            $scope.download_url = apiPaths.apiSerivicesUrl + '/campaigns/' + $scope.selectedCampaign.id + '/inventory/' + $scope.selected_filters.domain + '/download?date_filter=' + $scope.selected_filters.time_filter;
        };

        $scope.callBackCampaignsFailure = function() {
            $scope.strategyFound = false;
        };
        $scope.callBackCampaignChange = function() {
            $scope.selectedStrategy = domainReports.getDefaultValues()['strategy'];
            if ($scope.selectedCampaign.id !== -1) {
                $scope.strategylist($scope.selectedCampaign.id);
                $scope.callBackCampaignsSuccess();
            }
            else {
                $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
            }
            $scope.$apply();
            $scope.inventoryChart = true;
            if ($scope.tacticList[$scope.tacticList.show][0]) {
                $scope.tacticList[$scope.tacticList.show][0].chart = true;
            }
        };

        //This function is called from the directive, onchange of the dropdown
        $scope.callBackKpiDurationChange = function (kpiType) {
            if (kpiType == 'duration') {
                $scope.download_url = apiPaths.apiSerivicesUrl + '/campaigns/' + $scope.selectedCampaign.id + '/inventory/' + $scope.selected_filters.domain + '/download? date_filter=' + $scope.selected_filters.time_filter;
                dataTransferService.updateExistingStorageObjects({'filterDurationType': $scope.selected_filters.time_filter, 'filterDurationValue': $scope.selected_filters.time_filter_text});
            } else {
                dataTransferService.updateExistingStorageObjects({'filterKpiType': $scope.selected_filters.kpi_type, 'filterKpiValue': $scope.selected_filters.kpi_type_text});
            }
            $scope.getStrategyChart({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, domain: $scope.selected_filters.domain, time_filter: $scope.selected_filters.time_filter });
            $scope.getTacticList({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, domain: $scope.selected_filters.domain, time_filter: $scope.selected_filters.time_filter });
            $scope.$apply();
        };

        //Function called when the user clicks on the category tabs
        $('#category_change').click(function (e) {
            $scope.inventoryChart = true;
            if (domainReports.checkStatus($scope.selectedCampaign.name, $scope.selectedStrategy.name)) {
                /* $scope.strategyTable.show = 'Top';
                 $scope.strategyTable.cssClass = 'top_perf_symbol';
                 $scope.tacticList.show = 'topPerformance';*/
                $scope.selected_filters.domain = $(e.target).attr('_key');
                $(".inventory_tab_active").removeClass("inventory_tab_active");
                $(e.target).parent().addClass("inventory_tab_active");
                $scope.$apply();
                $scope.download_url = apiPaths.apiSerivicesUrl + '/campaigns/' + $scope.selectedCampaign.id + '/inventory/' + $scope.selected_filters.domain + '/download?date_filter=' + $scope.selected_filters.time_filter;
                $scope.getStrategyChart({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, domain: $scope.selected_filters.domain, time_filter: $scope.selected_filters.time_filter });
                $scope.getTacticList({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, domain: $scope.selected_filters.domain, time_filter: $scope.selected_filters.time_filter });
            }
        });
    });
}());