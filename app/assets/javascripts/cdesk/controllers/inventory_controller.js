var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('InventoryController', function ($scope, $http, inventoryService, columnline) {


        $scope.selectedCampaign = {
            id: '-1',
            name: 'Loading...'
        };

        $scope.selectedStrategy = {
            id: '-1',
            name: 'Loading...'
        };

        $scope.selected_filters = {
            time_filter: 'life_time',
            time_filter_text: 'Last Year',
            kpi_type: 'CPA',
            tb: '1',
            domain: 'category'
        };

        $scope.strategyTable = {
            topPerformance: [],
            bottomPerformance: [],
            show: 'Top',
            cssClass: 'top_perf_symbol'
        };

        $scope.tacticList ={
            tacticList:[],
            topPerformance: [],
            bottomPerformance: [],
            show:'topPerformance'
        };

        $scope.durationFilter=[
            {value: 'weekly',  text: 'Last 7 days'},
            {value: 'monthly',  text: 'Last month'},
            {value: 'life_time',  text: 'Last Year'}
        ];

        $scope.kpiTypeFilter=['CPA', 'CPC', 'CPM', 'CTR'];

        $scope.init = function () {
            $scope.campaignlist();
        };

        $scope.campaignlist = function () {
            inventoryService.getCampaingsForUser().then(function (result) {
                $scope.campaingns = result.data.data.slice(0,100);
                if (result.status === "OK" || result.status === "success") {
//                    $('.page_loading').css({'display': 'none'});
                }

                if (typeof  $scope.campaingns !== 'undefined' && $scope.campaingns.length > 0) {
                    $scope.selectedCampaign.id = $scope.campaingns[0].campaign_id;
                    $scope.selectedCampaign.name = $scope.campaingns[0].name;
                }
                else{
                    if (typeof  $scope.campaingns !== 'undefined' && $scope.campaingns.length > 0) {
                        $scope.selectedCampaign.id = -1;
                        $scope.selectedCampaign.name = "No Campaign Found";
                    }
                }
                if ($scope.selectedCampaign.id !== -1) {
                    $scope.strategylist($scope.selectedCampaign.id);
                }
            });
        };

        $scope.strategylist = function (campaignId) {
            $scope.selectedStrategy.name = "Loading...";
            inventoryService.getStrategiesForCampaign(campaignId).then(function (result) {
                $scope.strategies = result.data.data;
                if ($scope.strategies !== 'undefined' && $scope.strategies.length > 0) {
                    $scope.selectedStrategy.id = $scope.strategies[0].id;
                    $scope.selectedStrategy.name = $scope.strategies[0].name;
                    $scope.getStrategyChart({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, domain: $scope.selected_filters.domain,time_filter: $scope.selected_filters.time_filter });
                    $scope.getTacticList({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, domain: $scope.selected_filters.domain, time_filter: $scope.selected_filters.time_filter});

                }
                else{ //  means empty strategy list
                    $scope.selectedStrategy.id = -1;
                    $scope.selectedStrategy.name = "No Strategy Found";
                    $scope.inventoryChart = false;
                }
            });

        };
        //This function is called for tactics Table data
        $scope.getTacticList = function (param) {
            inventoryService.getAllTacticDomainData(param).then(function (result) {
                //    if(result.data !== 'undefined' && result.data.length >0) {
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
//                }
//                else{
//                   var bottomChartObj = false;
//                   var topChartObj = false;
//                   $scope.inventoryChart = false;
//                }
            });
        };

        $scope.inventoryChart = true;
        //Function called to draw the Strategy chart
        $scope.getStrategyChart = function (param) {
            inventoryService.getCategoryDataForStrategy(param).then(function (result) {
                if (result.status === "OK" || result.status === "success") {
                    // $('.page_loading').css({'display': 'none'});
                }
                var resultTableData = result.data.data[0].inv_metrics;

                for (var data in resultTableData) {
                    if (resultTableData[data].tb === 1) {
                        $scope.strategyTable.topPerformance.push(resultTableData[data]);

                    } else {
                        $scope.strategyTable.bottomPerformance.push(resultTableData[data]);
                    }
                }
                //Default show the top performance strategies
                $scope.strategyTableData = $scope.strategyTable.topPerformance.slice(0, 5);
                $scope.inventoryChart = columnline.highChart($scope.strategyTableData, $scope.selected_filters.kpi_type);
                if ($scope.inventoryChart === undefined || $scope.inventoryChart === null || resultTableData === undefined) {
                    $scope.inventoryChart = false;
                }
            });
        };

        //Function called when the user clicks on the 'Top performance' button
        $scope.showPerformance = function (flag) {
            if($scope.checkStatus()) {
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
                $scope.inventoryChart = columnline.highChart($scope.strategyTableData, $scope.selected_filters.kpi_type);
            }
        };

        //Function to expand and collide tactic accordian.
        $scope.clickTactic = function(id){
            $('#tactic_'+id+'_body').toggle();
        };

        $scope.checkStatus = function(){
            if($scope.selectedCampaign.name ==  'Loading...' ||
                $scope.selectedStrategy.name ==  'Loading...' ||
                $scope.selectedCampaign.name ==  'No Campaign Found' ||
                $scope.selectedStrategy.name ==  'No Strategy Found'){
                return false;
            }
            return true;
        };
        //Function called when the user clicks on the strategy dropdown
        $('#strategies_list').click(function (e) {
            //$('.page_loading').css({'display': 'block'});
            if($scope.checkStatus()) {
                $scope.selectedStrategy.id = $(e.target).attr('value');
                $scope.selectedStrategy.name = $(e.target).text();
                $scope.$apply();
                $scope.getStrategyChart({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, domain: $scope.selected_filters.domain, time_filter: $scope.selected_filters.time_filter });
                $scope.getTacticList({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, domain: $scope.selected_filters.domain, time_filter: $scope.selected_filters.time_filter });
            }
        });
        //Function called when the user clicks on the campaign dropdown
        $('#campaigns_list').click(function (e) {
            // $('.page_loading').css({'display': 'block'});
            if($scope.checkStatus()) {
                $scope.selectedCampaign.id = $(e.target).attr('value');
                $scope.selectedCampaign.name = $(e.target).text();
                $scope.$apply();
                $scope.strategylist($scope.selectedCampaign.id);
            }
        });

        $('#time_filter_list').click(function(e){
            //  $('.page_loading').css({'display': 'block'});
            if($scope.checkStatus()) {
                $scope.selected_filters.time_filter = $(e.target).attr('value');
                $scope.selected_filters.time_filter_text = $(e.target).text();
                $scope.$apply();
                $scope.getStrategyChart({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, domain: $scope.selected_filters.domain, time_filter: $scope.selected_filters.time_filter });
            }
        });

        //Function called when the user clicks on the CPA dropdown
        $('#kpi_list').click(function (e) {
            // $('.page_loading').css({'display': 'block'});
            if($scope.checkStatus()) {
                $scope.selected_filters.kpi_type = $(e.target).text();
                $scope.$apply();
                $scope.getStrategyChart({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, domain: $scope.selected_filters.domain, time_filter: $scope.selected_filters.time_filter });
                $scope.getTacticList({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, domain: $scope.selected_filters.domain, time_filter: $scope.selected_filters.time_filter });
            }
        });

        //Function called when the user clicks on the category tabs
        $('#category_change').click(function (e) {
            if($scope.checkStatus()) {
                $scope.selected_filters.domain = $(e.target).attr('_key');
                //  $('.page_loading').css({'display': 'block'});
                $(".inventory_tab_active").removeClass("inventory_tab_active");
                $(e.target).parent().addClass("inventory_tab_active");
                $scope.$apply();
                $scope.getStrategyChart({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, domain: $scope.selected_filters.domain, time_filter: $scope.selected_filters.time_filter });
                $scope.getTacticList({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, domain: $scope.selected_filters.domain, time_filter: $scope.selected_filters.time_filter });
            }
        });

        //Hot fix to show the campaign tab selected
        $("ul.nav:first").find('.active').removeClass('active').end().find('li:contains(Reports)').addClass('active');
    });
}());