var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('performanceController', function ($scope, performanceService , utils, dataTransferService, domainReports, apiPaths) {


        $scope.selectedCampaign = domainReports.getDefaultValues();

        $scope.selectedStrategy = domainReports.getDefaultValues();

        $scope.selected_filters = domainReports.getDurationKpi();

        $scope.filters = domainReports.getReportsDropDowns();

        $scope.selected_filters.tab = 'byscreens';


        //Hot fix to show the campaign tab selected
        $("ul.nav:first").find('.active').removeClass('active').end().find('li:contains(Reports)').addClass('active');

        $scope.noTacticsFound = false ;

        $scope.tacticList = {};

        $scope.strategyPerfDataByScreen = {};
        $scope.strategyPerfDataByFormat = {};
        $scope.strategyPerfDataByDOW = {};


        $scope.tacticsPerfDataListByScreen = {};
        $scope.tacticsPerfDataListByFormat = {};
        $scope.tacticsPerfDataListByDOW = {};


        $scope.dataNotFoundForScreen = false ;
        $scope.dataNotFoundForFormat = false ;
        $scope.dataNotFoundForDOW = false ;
        $scope.dataNotFound = false;

        $scope.tacticPerfDataByScreen = function (param) {

            console.log("get tactic perf data");
            console.log(param);
//            console.log($scope.noTacticsFound);
//            console.log(Object.getOwnPropertyNames($scope.tacticList).length);


            if ($scope.noTacticsFound !== true) { //} && Object.getOwnPropertyNames($scope.tacticList).length === 0 ) {

                performanceService.getTacticsForStrategy(param).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        $scope.tacticList = result.data.data;
                        $scope.dataNotFound = false ;
                        $scope.noTacticsFound = false;
                        console.log($scope.tacticList);

                        var _tacticsPerfList = [];

                        if ($scope.tacticList !== 'undefined') {
                            console.log("call for perf data in tactics");
                            var tacticParams = {
                                campaignId: param.campaignId,
                                strategyId: param.strategyId,
                                tacticId: '',
                                tacticName: '',
                                tab: $scope.selected_filters.tab,
                                timeFilter: param.timeFilter
                            };


                            if ($scope.selected_filters.tab == 'bydaysofweek') { // && Object.getOwnPropertyNames($scope.tacticsPerfDataListByDOW).length === 0) {

                                for (var index in $scope.tacticList) {
                                    tacticParams.tacticId = $scope.tacticList[index].id;
                                    tacticParams.tacticName = $scope.tacticList[index].description;

                                    console.log(" the selected tab is " + $scope.selected_filters.tab + " tactic api is called");
                                    performanceService.getTacticPerfData(tacticParams).then(function (result) {
                                        if (result.status === "OK" || result.status === "success") {
                                            console.log("tactic perf data found for " + tacticParams.tacticId);
                                            var _tacticPerfData = result.data.data;
                                            for (var i in _tacticPerfData) {
                                                _tacticPerfData[i].description = tacticParams.tacticName;
                                            }
                                            _tacticsPerfList.push(_tacticPerfData);
                                            $scope.tacticPerfDataListByDOW = _tacticsPerfList;
                                        }

                                        else {
                                            $scope.dataNotFound = true;
                                        }
                                    });
                                }
                            } else if ($scope.selected_filters.tab == 'byformats' ) { //} && Object.getOwnPropertyNames($scope.tacticsPerfDataListByFormat).length === 0) {

                               console.log("tactic perf data by foramt code block called ");
                                for (var index in $scope.tacticList) {
                                    console.log("***************************");
                                    tacticParams.tacticId = $scope.tacticList[index].id;
                                    tacticParams.tacticName = $scope.tacticList[index].description;

                                    console.log(" the selected tab is " + $scope.selected_filters.tab + " tactic api is called for "+tacticParams.tacticId);
                                    console.log(tacticParams);
                                    performanceService.getTacticPerfData(tacticParams).then(function (result) {
                                        if (result.status === "OK" || result.status === "success") {
                                          //  console.log("tactic perf data found for " + tacticParams.tacticId);
                                            var _tacticPerfData = result.data.data;
                                            console.log(_tacticPerfData);
                                            for (var i in _tacticPerfData) {
                                                _tacticPerfData[i].description = tacticParams.tacticName;
                                            }
                                            _tacticsPerfList.push(_tacticPerfData);
                                            $scope.tacticsPerfDataListByFormat = _tacticsPerfList;
                                            console.log($scope.tacticsPerfDataListByFormat);
                                        }
                                        else {
                                            $scope.dataNotFound = true;
                                        }
                                    });
                                }

                            } else if ($scope.selected_filters.tab == 'byscreens'){ // && Object.getOwnPropertyNames($scope.tacticsPerfDataListByScreen).length === 0) {
                                console.log("tactic perf data by screen");
                                for (var index in $scope.tacticList) {
                                    tacticParams.tacticId = $scope.tacticList[index].id;
                                    tacticParams.tacticName = $scope.tacticList[index].description;
                                    console.log(tacticParams);

                                    console.log(" the selected tab is " + $scope.selected_filters.tab + " tactic api is called");
                                    performanceService.getTacticPerfData(tacticParams).then(function (result) {
                                        if (result.status === "OK" || result.status === "success") {
                                            console.log("tactic perf data found for " + tacticParams.tacticId);
                                            var _tacticPerfData = result.data.data;
                                            for (var i in _tacticPerfData) {
                                                _tacticPerfData[i].description = tacticParams.tacticName;
                                            }
                                            _tacticsPerfList.push(_tacticPerfData);
                                            $scope.tacticsPerfDataListByScreen = _tacticsPerfList;
                                        }

                                        else {
                                            $scope.dataNotFound = true;
                                        }
                                    });
                                }

                            }
                        }


                    } else {
                        // No tactics for a given strategy
                        $scope.noTacticsFound = true;
                    }

                });
            }
        };

        $scope.strategyPerformanceDataByScreen = function(param) {

            console.log("strategy performance data call from updateStrategy function.Params are");
            console.log(param);
            console.log($scope.selected_filters.tab);
            console.log(Object.getOwnPropertyNames($scope.strategyPerfDataByFormat).length);
          //  console.log($scope.selected_filters.tab === 'byformats' && Object.getOwnPropertyNames($scope.strategyPerfDataByFormat).length  === 0);

            if ($scope.selected_filters.tab === 'bydaysofweek'){ // && Object.getOwnPropertyNames($scope.strategyPerfDataByDOW).length === 0) {

                console.log(" tab is " + $scope.selected_filters.tab + " api is called");
                performanceService.getStrategyPerfData(param).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        $scope.strategyPerfDataByDOW = result.data.data;
                        $scope.tacticPerfDataByScreen(param);
                    }
                    else {
                        $scope.dataNotFoundForDOW = true;
                    }
                });
            } else if ($scope.selected_filters.tab === 'byformats' ) { //&& Object.getOwnPropertyNames($scope.strategyPerfDataByFormat).length  === 0) {
                console.log("  tab is " + $scope.selected_filters.tab + " api is called");
                performanceService.getStrategyPerfData(param).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        $scope.strategyPerfDataByFormat = result.data.data;
                        console.log(" Got Strategy data by fromat successfully ");
                       // console.log( $scope.strategyPerfDataByFormat );

                        //console.log(result.data.data);
                        $scope.tacticPerfDataByScreen(param);
                    }
                    else {
                        $scope.dataNotFoundForFormat = true;
                    }
                });

            } else if ($scope.selected_filters.tab === 'byscreens' ) { // && Object.getOwnPropertyNames($scope.strategyPerfDataByScreen).length === 0) {

                console.log("  tab is " + $scope.selected_filters.tab + " api is called");
                performanceService.getStrategyPerfData(param).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        $scope.strategyPerfDataByScreen = result.data.data;
                        $scope.tacticPerfDataByScreen(param);
                    }
                    else {
                        $scope.dataNotFoundForScreen = true;
                    }
                });
            }
        };

        $scope.updateStrategyObjects = function(strategy){
            $scope.strategies = strategy;
           // console.log($scope.strategies);
            if ($scope.strategies !== 'undefined' && $scope.strategies.length > 0) {
                //If a different campaign is selected, then load the first strategy data
                var strategyObj = domainReports.loadFirstStrategy($scope.strategies[0].id, $scope.strategies[0].name);
                $scope.selectedStrategy.id =  strategyObj.id;
                $scope.selectedStrategy.name =  strategyObj.name;
                // $scope.selectedStrategy.startDate = strat
                $scope.strategyFound = true;
                $scope.dataNotFound = false;
                console.log("strategy performance data by screen");
                    $scope.strategyPerformanceDataByScreen({campaignId: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, tab: $scope.selected_filters.tab, timeFilter: $scope.selected_filters.time_filter });
            } else { //  means empty strategy list
                $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
                $scope.tacticNotFound=true;
                $scope.dataNotFound = true;
            }
        };





        $scope.strategylist = function (campaignId) {
            $scope.selectedStrategy.name = "Loading...";
            if(dataTransferService.getCampaignStrategyList(campaignId) === false){
                domainReports.getCampaignStrategyList(campaignId).then(function (result) {
                    var strategy = result.data.data;
                    dataTransferService.setCampaignStrategyList(campaignId , strategy);
                    $scope.updateStrategyObjects(strategy);
                });
            }else{
                $scope.updateStrategyObjects(domainReports.getCampaignStrategyList(campaignId));
            }
        };


        $scope.callBackCampaignsSuccess= function(){
            //TODO, logic needs to be done
        };

        $scope.callBackCampaignsFailure= function(){
            //TODO, logic needs to be done
        };

        //Called from directive_controller.js,  when the user selects the campaign dropdown option
        $scope.callBackCampaignChange = function () {
            if ($scope.selectedCampaign.id !== -1) {
               // $scope.callBackCampaignsSuccess();
                console.log("call back campaign change");
                $scope.strategylist($scope.selectedCampaign.id);
            } else {
                $scope.$parent.selectedStrategy = domainReports.getNotFound()['strategy'];
            }
        };

        //Function is called from startegylist directive
        $scope.callBackStrategyChange = function() {
            //TODO logic of onchnage campaign
            //Call the chart to load with the changed campaign id and strategyid
            //$scope.getStrategyList({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, time_filter: $scope.selected_filters.time_filter });
        };

        $(document).ready( function() {
            $(".each_tab").click( function() {
                var tab_id = $(this).attr("id").split("_tab")
                console.log("tab is clicked");
                $scope.selected_filters.tab = tab_id[0];
                console.log($scope.selected_filters.tab);
                $( ".reports_tabs_holder").find(".active").removeClass("active") ;
                $( this ).addClass("active") ;
                $( ".reports_block").hide() ;
                $( "#reports_" + tab_id[0] + "_block" ).show() ;
                console.log("update strategy performance data by screen");
                $scope.strategyPerformanceDataByScreen({campaignId: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, tab: $scope.selected_filters.tab, timeFilter: $scope.selected_filters.time_filter })
            }) ;
        }) ;



//        //TODO: This function is called from the directive, onchange of the dropdown.It will be done when dropdown is implemented.
//        $scope.callBackKpiDurationChange = function (kpiType) {
//            if (kpiType == 'duration') {
//                $scope.strategyViewData({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, time_filter: $scope.selected_filters.time_filter });
//                dataTransferService.updateExistingStorageObjects({'filterDurationType': $scope.selected_filters.time_filter, 'filterDurationValue': $scope.selected_filters.time_filter_text});
//                var urlPath = apiPaths.apiSerivicesUrl + '/campaigns/' + $scope.selectedCampaign.id + '/viewability/';
//                $scope.download_urls = {
//                    tactics: urlPath + 'tactics/download?date_filter=' + $scope.selected_filters.time_filter,
//                    domains: urlPath + 'domains/download?date_filter=' + $scope.selected_filters.time_filter,
//                    publishers: urlPath + 'publishers/download?date_filter=' + $scope.selected_filters.time_filter,
//                    exchanges: urlPath + 'exchanges/download?date_filter=' + $scope.selected_filters.time_filter
//                };
//            } else {
//                $scope.$apply();
//                dataTransferService.updateExistingStorageObjects({'filterKpiType': $scope.selected_filters.kpi_type, 'filterKpiValue': $scope.selected_filters.kpi_type_text});
//            }
//        };


    });
}());