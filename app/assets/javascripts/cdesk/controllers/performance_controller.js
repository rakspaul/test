var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('performanceController', function ($scope, performanceService, utils, dataTransferService, domainReports, apiPaths) {

        //Hot fix to show the campaign tab selected
        $("ul.nav:first").find('.active').removeClass('active').end().find('li:contains(Reports)').addClass('active');

        $scope.selectedCampaign = domainReports.getDefaultValues()['campaign'];

        $scope.selectedStrategy = domainReports.getDefaultValues()['strategy'];

        $scope.selected_filters = domainReports.getDurationKpi();

        $scope.filters = domainReports.getReportsDropDowns();

        $scope.selected_filters.tab = 'byscreens';


        $scope.download_urls = {
            screens: null,
            daysOfWeek: null
        };

        $scope.init= function(){

            $scope.strategyFound = false ;

            $scope.screenBusy = false;
            $scope.tacticScreenBusy = false ;

            $scope.formatBusy = false;
            $scope.tacticFormatBusy = false;

            $scope.dowBusy = false;
            $scope.tacticDowBusy = false ;

            $scope.firstTime = true;
            $scope.noTacticsFound = false;

            $scope.tacticList = {};

            $scope.strategyPerfDataByScreen = {};
            $scope.strategyPerfDataByFormat = {};
            $scope.strategyPerfDataByDOW = {};

            $scope.tacticsPerfDataListByScreen = {};
            $scope.tacticsPerfDataListByFormat = {};
            $scope.tacticsPerfDataListByDOW = {};

            $scope.dataNotFoundForScreen = false;
            $scope.dataNotFoundForFormat = false;
            $scope.dataNotFoundForDOW = false;
        };

        $scope.init();
        $scope.tacticPerfData = function (param) {



            if ($scope.noTacticsFound !== true){ // && Object.getOwnPropertyNames($scope.tacticList).length === 0 ) {

             //   console.log(" inside tactic perf data");
                performanceService.getTacticsForStrategy(param).then(function (result) {
               //     console.log($scope.firstTime);
                    if (result.status === "OK" || result.status === "success") {
                        $scope.tacticList = result.data.data;
                        $scope.noTacticsFound = false;

                        var _tacticsPerfList = [];

                        if ($scope.tacticList !== 'undefined') {

                            var tacticParams = {
                                campaignId: param.campaignId,
                                strategyId: param.strategyId,
                                tacticId: '',
                                tacticName: '',
                                startDate: '',
                                endDate: '',
                                tab: $scope.selected_filters.tab,
                                timeFilter: param.timeFilter
                            };

                            if ($scope.selected_filters.tab == 'bydaysofweek' && Object.getOwnPropertyNames($scope.tacticsPerfDataListByDOW).length === 0) {
                                $scope.tacticDowBusy = true ;

                                for (var index in $scope.tacticList) {
                                    tacticParams.tacticId = $scope.tacticList[index].id;
                                    tacticParams.tacticName = $scope.tacticList[index].description;
                                    tacticParams.startDate = $scope.tacticList[index].startDate;
                                    tacticParams.endDate = $scope.tacticList[index].endDate;

//                                    console.log(" tactics params are");
//                                    console.log(tacticParams);


                                    performanceService.getTacticPerfData(tacticParams).then(function (result) {
                                        if (result.status === "OK" || result.status === "success") {

                                            var _tacticPerfData = result.data.data;
                                            $scope.tacticDowBusy = false ;
                                            for (var i in _tacticPerfData) {
                                                _tacticPerfData[i].description = tacticParams.tacticName;
                                            }
                                            _tacticsPerfList.push(_tacticPerfData);
                                            $scope.tacticsPerfDataListByDOW = _tacticsPerfList;

                                        }

                                        else {

                                            $scope.tacticDowBusy = false ;
                                        }
                                    });
                                }
                            } else if ($scope.selected_filters.tab == 'byformats' && Object.getOwnPropertyNames($scope.tacticsPerfDataListByFormat).length === 0) {
                                $scope.tacticFormatBusy = true ;

                                for (var index in $scope.tacticList) {

                                    tacticParams.tacticId = $scope.tacticList[index].id;
                                    tacticParams.tacticName = $scope.tacticList[index].description;
                                    tacticParams.startDate = $scope.tacticList[index].startDate;
                                    tacticParams.endDate = $scope.tacticList[index].endDate;



                                    performanceService.getTacticPerfData(tacticParams).then(function (result) {
                                        if (result.status === "OK" || result.status === "success") {

                                            var _tacticPerfData = result.data.data;
                                            $scope.tacticFormatBusy = false;

                                            for (var i in _tacticPerfData) {
                                                _tacticPerfData[i].description = tacticParams.tacticName;
                                            }
                                            _tacticsPerfList.push(_tacticPerfData);
                                            $scope.tacticsPerfDataListByFormat = _tacticsPerfList;

                                        }
                                        else {

                                            $scope.tacticFormatBusy = false ;
                                        }
                                    });
                                }

                            } else if ($scope.selected_filters.tab == 'byscreens' && Object.getOwnPropertyNames($scope.tacticsPerfDataListByScreen).length === 0) {

                                $scope.tacticScreenBusy = true ;

                                for (var index in $scope.tacticList) {
                                    tacticParams.tacticId = $scope.tacticList[index].id;
                                    tacticParams.tacticName = $scope.tacticList[index].description;
                                    tacticParams.startDate = $scope.tacticList[index].startDate;
                                    tacticParams.endDate = $scope.tacticList[index].endDate;


                                    performanceService.getTacticPerfData(tacticParams).then(function (result) {
                                        if (result.status === "OK" || result.status === "success") {
                                            var _tacticPerfData = result.data.data;
                                            $scope.tacticScreenBusy = false ;
                                            for (var i in _tacticPerfData) {
                                                _tacticPerfData[i].description = tacticParams.tacticName;
                                            }
                                            _tacticsPerfList.push(_tacticPerfData);
                                            $scope.tacticsPerfDataListByScreen = _tacticsPerfList;
                                        }

                                        else {

                                            $scope.tacticScreenBusy = false ;
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

        $scope.strategyPerformanceData = function (param) {
          //  console.log($scope.selected_filters.tab === 'byscreens'  && ( Object.getOwnPropertyNames($scope.strategyPerfDataByScreen).length === 0 || Object.getOwnPropertyNames($scope.tacticsPerfDataListByScreen).length === 0 ));

            if ($scope.selected_filters.tab === 'bydaysofweek' && Object.getOwnPropertyNames($scope.strategyPerfDataByDOW).length === 0) {
               $scope.dowBusy = true;
               $scope.tacticDowBusy = true;
                performanceService.getStrategyPerfData(param).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        $scope.strategyPerfDataByDOW = result.data.data;
                        $scope.tacticPerfData(param);
                        $scope.dowBusy = false ;
                        $scope.tacticDowBusy = false ;
                    }
                    else {
                        $scope.dataNotFoundForDOW = true;
                        $scope.dowBusy = false ;
                        $scope.tacticDowBusy = false ;

                    }
                });
            } else if ($scope.selected_filters.tab === 'byformats' && Object.getOwnPropertyNames($scope.strategyPerfDataByFormat).length  === 0  ) {
                $scope.formatBusy = true;
                $scope.tacticFormatBusy = true ;
                performanceService.getStrategyPerfData(param).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        $scope.strategyPerfDataByFormat = result.data.data;
                        $scope.tacticPerfData(param);
                        $scope.formatBusy = false ;
                        $scope.tacticFormatBusy = false ;
                    }
                    else {
                        $scope.dataNotFoundForFormat = true;
                        $scope.formatBusy = false ;
                        $scope.tacticFormatBusy = false;
                       // $scope.dataNotFound = true;
                    }
                });

            } else if ($scope.selected_filters.tab === 'byscreens'  &&  Object.getOwnPropertyNames($scope.strategyPerfDataByScreen).length === 0) {

                $scope.screenBusy = true;
                $scope.tacticScreenBusy = true ;

                performanceService.getStrategyPerfData(param).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        $scope.strategyPerfDataByScreen = result.data.data;
                        $scope.screenBusy = false;
                        $scope.tacticPerfData(param);
                    }
                    else {
                        $scope.dataNotFoundForScreen = true;
                        $scope.screenBusy = false;
                        $scope.tacticScreenBusy = false;

                    }
                });


                // ******************************************************************
                // performance tunning
                //******************************************************************

//                if ($scope.firstTime) {
//
//                    // ******************************************************************
//                    // load other format tabs strategy data.
//                    //************************************************************************
//
//                    var formatParamsForStrategy = {
//                        campaignId: $scope.selectedCampaign.id,
//                        strategyId: $scope.selectedStrategy.id,
//                        strategyStartDate: $scope.selectedStrategy.startDate,
//                        strategyEndDate: $scope.selectedStrategy.endDate,
//                        tab: "byformats",  //bydaysofweek
//                        timeFilter: $scope.selected_filters.time_filter
//                    };
//
//                    performanceService.getStrategyPerfData(formatParamsForStrategy).then(function (result) {
//                        if (result.status === "OK" || result.status === "success") {
//                            $scope.strategyPerfDataByFormat = result.data.data;
//                            $scope.formatBusy = false;
//                            $scope.tacticPerfData(formatParamsForStrategy);
//                        }
//                        else {
//                            $scope.dataNotFoundForFormat = true;
//                            $scope.formatBusy = false;
//                            // $scope.dataNotFound = true;
//                        }
//                    });
//
//                    console.log("performance tunnings for format successfull");
//
//
//                    // ******************************************************************
//                    // load other days of week tabs strategy data.
//                    //************************************************************************
//
//                    var daysOfWeekParamsForStrategy = {
//                        campaignId: $scope.selectedCampaign.id,
//                        strategyId: $scope.selectedStrategy.id,
//                        strategyStartDate: $scope.selectedStrategy.startDate,
//                        strategyEndDate: $scope.selectedStrategy.endDate,
//                        tab: "bydaysofweek",
//                        timeFilter: $scope.selected_filters.time_filter
//                    };
//
//                    performanceService.getStrategyPerfData(daysOfWeekParamsForStrategy).then(function (result) {
//                        if (result.status === "OK" || result.status === "success") {
//                            $scope.strategyPerfDataByDOW = result.data.data;
//                            $scope.dowBusy = false;
//                            $scope.tacticPerfData(daysOfWeekParamsForStrategy);
//                        }
//                        else {
//                            $scope.dataNotFoundForDOW = true;
//                            $scope.dowBusy = false;
//                            //    $scope.dataNotFound = true
//                        }
//                    });
//
//                    console.log("performance tunnings for bydaysofweek successfull");
//
//                    $scope.firstTime = false;
//
//                }
            }


        };

        $scope.updateStrategyObjects = function (strategy) {

            $scope.strategies = strategy;
            if ($scope.strategies !== 'undefined' && $scope.strategies.length > 0) {
                //If a different campaign is selected, then load the first strategy data
                var strategyObj = domainReports.loadFirstStrategy($scope.strategies[0].id, $scope.strategies[0].name, $scope.strategies[0].startDate, $scope.strategies[0].endDate);
                $scope.selectedStrategy.id = strategyObj.id;
                $scope.selectedStrategy.name = strategyObj.name;
                $scope.selectedStrategy.startDate = strategyObj.startDate;
                $scope.selectedStrategy.endDate = strategyObj.endDate;


                $scope.strategyFound = true;
                $scope.dataNotFound = false;
                if( $scope.selectedStrategy.id == -1){
                    $scope.strategyFound = false;
                }
                else {
                    $scope.strategyPerformanceData({campaignId: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, strategyStartDate: $scope.selectedStrategy.startDate, strategyEndDate: $scope.selectedStrategy.endDate, tab: $scope.selected_filters.tab, timeFilter: $scope.selected_filters.time_filter });
                }
            } else { //  means empty strategy list
                $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
                $scope.noTacticsFound = true;
                $scope.strategyFound = false;
                // $scope.dataNotFound = true;
            }
        };


        $scope.strategylist = function (campaignId) {
            $scope.selectedStrategy.name = "Loading...";
            if (dataTransferService.getCampaignStrategyList(campaignId) === false) {
                domainReports.getCampaignStrategyList(campaignId).then(function (result) {
                    var strategy = result.data.data;
                    dataTransferService.setCampaignStrategyList(campaignId, strategy);
                    $scope.updateStrategyObjects(strategy);
                });
            } else {
                $scope.updateStrategyObjects(domainReports.getCampaignStrategyList(campaignId));
            }
        };

        //This will be called from directive_controller.js
        $scope.callBackCampaignsSuccess = function () {
            $scope.init();
            var urlPath = apiPaths.apiSerivicesUrl + '/campaigns/' + $scope.selectedCampaign.id + '/performance/';

            $scope.download_urls = {
                screens: urlPath + 'screensandformats/download?date_filter=' + $scope.selected_filters.time_filter,
                daysOfWeek: urlPath + 'daysofweek/download?date_filter=' + $scope.selected_filters.time_filter
            };
        };

        //Called from directive_controller.js,  this is required, do not remove;
        $scope.callBackCampaignsFailure = function () {
            console.log('This function is required : callBackCampaignsFailure');
            $scope.strategyFound = false ;
        };

        //Called from directive_controller.js,  when the user selects the campaign dropdown option
        $scope.callBackCampaignChange = function () {
            if ($scope.selectedCampaign.id !== -1) {
                $scope.init();
                $scope.callBackCampaignsSuccess();
                $scope.strategylist($scope.selectedCampaign.id);
            } else {
                $scope.$parent.selectedStrategy = domainReports.getNotFound()['strategy'];
              //  $scope.dataNotFound = true;
                $scope.strategyFound = false ;
            }
        };

        //Function is called from startegylist directive
        $scope.callBackStrategyChange = function () {
            //Call  to load with the changed campaign id and strategyid

            if($scope.selectedStrategy.id == -1)
                $scope.strategyFound = false ;

           else {
                $scope.init();
                $scope.strategyPerformanceData({campaignId: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, strategyStartDate: $scope.selectedStrategy.startDate, strategyEndDate: $scope.selectedStrategy.endDate, tab: $scope.selected_filters.tab, timeFilter: $scope.selected_filters.time_filter });
            }
        };

        $(document).ready(function () {
            $(".each_tab").click(function () {
                var tab_id = $(this).attr("id").split("_tab")

                $scope.selected_filters.tab = tab_id[0];
                $(".reports_tabs_holder").find(".active").removeClass("active");
                $(this).addClass("active");
                $(".reports_block").hide();
                $("#reports_" + tab_id[0] + "_block").show();

                $scope.strategyPerformanceData({campaignId: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, strategyStartDate: $scope.selectedStrategy.startDate, strategyEndDate: $scope.selectedStrategy.endDate, tab: $scope.selected_filters.tab, timeFilter: $scope.selected_filters.time_filter });
            });
        });


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