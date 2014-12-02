var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('performanceController', function ($scope, performanceService , utils, dataTransferService, domainReports, apiPaths) {


        $scope.selectedCampaign = domainReports.getDefaultValues();

        $scope.selectedStrategy = domainReports.getDefaultValues();

        $scope.selected_filters = domainReports.getDurationKpi();

        $scope.filters = domainReports.getReportsDropDowns();



        $scope.tabSelected =  'byscreens';


        //Hot fix to show the campaign tab selected
        $("ul.nav:first").find('.active').removeClass('active').end().find('li:contains(Reports)').addClass('active');

        $scope.noTacticsFound = false ;

        $scope.tacticList = {};

//        $scope.tacticListForStrategy = function(param){
//            // get list of tactics for a selected strategy.
//            console.log("get tactic list for strategy");
//            performanceService.getTacticsForStrategy(param).then(function(result) {
//                if(result.status === "OK" || result.status === "success") {
//
//                    $scope.tacticList = result.data.data ;
//                    $scope.dataNotFound = false
//                    console.log($scope.tacticList);
//                }
//                else {
//                    $scope.dataNotFound = true;
//                    $scope.noTacticsFound = true;
//                }
//            });
//
//        };

        $scope.tacticsPerfDataListByScreen = {};

        $scope.tacticPerfDataByScreen = function (param) {
         //   console.log("get tactic Perf data");
        //    if($scope.noTacticsFound === false){
            //    console.log($scope.noTacticsFound );
              //  $scope.tacticListForStrategy(param);

                console.log("get tactic list for strategy");
                performanceService.getTacticsForStrategy(param).then(function(result) {
                    if (result.status === "OK" || result.status === "success") {

                        $scope.tacticList = result.data.data;
                        $scope.dataNotFound = false
                        console.log($scope.tacticList);

                        var _tacticsPerfList = [];

                        if ($scope.tacticList !== 'undefined') {
                            console.log("call for perf data in tactics");
                            var tacticParams = {
                                campaignId: param.campaignId,
                                strategyId: param.strategyId,
                                tacticId: '',
                                tacticName: '',
                                timeFilter: param.timeFilter
                            };
                            console.log($scope.tacticList);

                            for (var index in $scope.tacticList) {
                                tacticParams.tacticId = $scope.tacticList[index].id;
                                tacticParams.tacticName = $scope.tacticList[index].description;
                                console.log(tacticParams);

                                performanceService.getTacticPerfData(tacticParams).then(function (result) {
                                    if (result.status === "OK" || result.status === "success") {
                                        console.log("tactic perf data found for " + tacticParams.tacticId);

                                        var _tacticPerfData = result.data.data;
                                        for (var i in _tacticPerfData) {
                                            _tacticPerfData[i].description = tacticParams.tacticName;
                                        }
                                        _tacticsPerfList.push(_tacticPerfData);
                                        //console.log(_tacticPerfData);
                                        $scope.tacticsPerfDataListByScreen = _tacticsPerfList;

                                    }
                                    else {
                                        console.log("tactic data not found");
                                    }
                                });
                            }
                        }

                        else {
                            $scope.dataNotFound = true;
                            $scope.noTacticsFound = true;
                        }
                    }
                    else {
                        $scope.dataNotFound = true;
                    }
                });

        };

       $scope.strategyPerfDataByScreen = {};

        $scope.strategyPerformanceDataByScreen = function(param){
            $scope.dataNotFound = true;
            performanceService.getStrategyPerfData(param).then(function (result) {
                if (result.status === "OK" || result.status === "success") {

                    $scope.strategyPerfDataByScreen = result.data.data;
                 //   console.log($scope.strategyPerfData);
                    if ( $scope.strategyPerfDataByScreen === 'undefined' && $scope.strategyPerfDataByScreen.isEmpty()) {
                        $scope.dataNotFound = true;

                    } else {
                        $scope.dataNotFound = false;
                        $scope.tacticPerfDataByScreen(param);
                    }
                } // Means no strategy data found from API either because of network failure or "failure" status
                else {
                    $scope.dataNotFound = true;
                }
            });

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
                //Call the chart to load with the changed campaign id and strategyid
                $scope.strategyPerformanceDataByScreen({campaignId: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, timeFilter: $scope.selected_filters.time_filter })
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

        $scope.callBackCampaignChange = function(){
            //TODO logic of onchnage campaign
            $scope.strategylist($scope.selectedCampaign.id);
        };

        //Function is called from startegylist directive
        $scope.callBackStrategyChange = function() {
            //TODO logic of onchnage campaign
            //Call the chart to load with the changed campaign id and strategyid
            //$scope.getStrategyList({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, time_filter: $scope.selected_filters.time_filter });
        };

        $(document).ready( function() {
            $(".each_tab").click( function() {
                var tab_id = $(this).attr("id").split("_tab") ;

                $scope.tabSelected = "by"+ tab_id ;
                console.log($scope.tabSelected);
                $( ".reports_tabs_holder").find(".active").removeClass("active") ;
                $( this ).addClass("active") ;
                $( ".reports_block").hide() ;
                $( "#reports_" + tab_id[0] + "_block" ).show() ;
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