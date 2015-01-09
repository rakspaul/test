var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('performanceController', function ($scope, performanceService, utils, dataTransferService, domainReports, apiPaths, constants, timePeriodModel) {

        //Hot fix to show the campaign tab selected
        $(".main_navigation").find('.active').removeClass('active').end().find('#reports_nav_link').addClass('active');

        $scope.selectedCampaign = domainReports.getDefaultValues()['campaign'];

        $scope.selectedStrategy = domainReports.getDefaultValues()['strategy'];

        $scope.selected_filters = domainReports.getDurationKpi();

        $scope.filters = domainReports.getReportsDropDowns();

        $scope.selected_filters.tab = 'bydaysofweek';

        $scope.performanceBusy = false;



        $scope.download_urls = {
            screens: null,
            daysOfWeek: null
        };

        $scope.init= function(){

         //   $scope.firstTime = true;

            $scope.strategyFound = false ;

            $scope.screenBusy = false;
            $scope.tacticScreenBusy = false ;

            $scope.formatBusy = false;
            $scope.tacticFormatBusy = false;

            $scope.dowBusy = false;
            $scope.tacticDowBusy = false ;

          //  $scope.firstTime = true;
           // $scope.noTacticsFound = false;

            $scope.tacticList = [];

            $scope.strategyPerfDataByScreen = [];
            $scope.strategyPerfDataByFormat = [];
            $scope.strategyPerfDataByDOW = [];

            $scope.tacticsPerfDataListByScreen = [];
            $scope.tacticsPerfDataListByFormat = [];
            $scope.tacticsPerfDataListByDOW = [];

            $scope.dataNotFoundForScreen = false;
            $scope.dataNotFoundForFormat = false;
            $scope.dataNotFoundForDOW = false;
        };

        $scope.init();
        $scope.tacticPerfData = function (param) {
                performanceService.getTacticsForStrategy(param).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        $scope.tacticList = result.data.data;
                       // $scope.noTacticsFound = false;
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

                            //     console.log("tactic list found");

                            if ($scope.selected_filters.tab == 'bydaysofweek') {
                                //        console.log("inside  days of week tab");
                                if ($scope.tacticsPerfDataListByDOW === 'undefined' || $scope.tacticsPerfDataListByDOW.length === 0) {
                                    $scope.tacticDowBusy = true;

                                    for (var index in $scope.tacticList) {
                                        tacticParams.tacticId = $scope.tacticList[index].id;
                                        tacticParams.tacticName = $scope.tacticList[index].description;
                                        tacticParams.startDate = $scope.tacticList[index].startDate;
                                        tacticParams.endDate = $scope.tacticList[index].endDate;
                                        //console.log("index="+index+", tactic name="+tacticParams.tacticName);

                                        performanceService.getTacticPerfData(tacticParams).then(function (result) {
                                            if (result.status === "OK" || result.status === "success") {
                                                var _tacticPerfData = result.data.data;
                                                $scope.tacticDowBusy = false;
                                                var tacticName='';
                                                for (var i in _tacticPerfData) {
                                                    if (tacticName === '')
                                                        for (var ndx in $scope.tacticList)
                                                            if (_tacticPerfData[i].id == $scope.tacticList[ndx].id)
                                                                tacticName=$scope.tacticList[ndx].description;
                                                    _tacticPerfData[i].description = tacticName;
                                                }
                                                _tacticsPerfList.push(_tacticPerfData);
                                                $scope.tacticsPerfDataListByDOW = _tacticsPerfList;
                                            }
                                            else {
                                                $scope.tacticDowBusy = false;
                                            }
                                        });
                                    }

                                }
                            } else if ($scope.selected_filters.tab == 'byformats') {
                                if ($scope.tacticsPerfDataListByFormat === 'undefined' || $scope.tacticsPerfDataListByFormat.length === 0) {
                                    $scope.tacticFormatBusy = true;

                                    for (var index in $scope.tacticList) {

                                        tacticParams.tacticId = $scope.tacticList[index].id;
                                        tacticParams.tacticName = $scope.tacticList[index].description;
                                        tacticParams.startDate = $scope.tacticList[index].startDate;
                                        tacticParams.endDate = $scope.tacticList[index].endDate;


                                        performanceService.getTacticPerfData(tacticParams).then(function (result) {
                                            if (result.status === "OK" || result.status === "success") {

                                                var _tacticPerfData = result.data.data;
                                                $scope.tacticFormatBusy = false;
                                                var tacticName='';
                                                for (var i in _tacticPerfData) {
                                                    if (tacticName === '')
                                                        for (var ndx in $scope.tacticList)
                                                            if (_tacticPerfData[i].id == $scope.tacticList[ndx].id)
                                                                tacticName=$scope.tacticList[ndx].description;
                                                    _tacticPerfData[i].description = tacticName;
                                                }

                                                _tacticsPerfList.push(_tacticPerfData);
                                                $scope.tacticsPerfDataListByFormat = _tacticsPerfList;

                                            }
                                            else {

                                                $scope.tacticFormatBusy = false;
                                            }
                                        });
                                    }
                                }

                            } else if ($scope.selected_filters.tab === 'byscreens') {
                                // console.log("tactic by screens ");
                                // console.log($scope.tacticsPerfDataListByScreen);
                                // console.log($scope.tacticsPerfDataListByScreen ==='undefined' || $scope.tacticsPerfDataListByScreen.length === 0 );
                                if ($scope.tacticsPerfDataListByScreen === 'undefined' || $scope.tacticsPerfDataListByScreen.length === 0) {
                                    $scope.tacticScreenBusy = true;

                                    for (var index in $scope.tacticList) {
                                        tacticParams.tacticId = $scope.tacticList[index].id;
                                        tacticParams.tacticName = $scope.tacticList[index].description;
                                        tacticParams.startDate = $scope.tacticList[index].startDate;
                                        tacticParams.endDate = $scope.tacticList[index].endDate;


                                        performanceService.getTacticPerfData(tacticParams).then(function (result) {
                                            if (result.status === "OK" || result.status === "success") {
                                                var _tacticPerfData = result.data.data;
                                                $scope.tacticScreenBusy = false;
                                                var tacticName='';
                                                for (var i in _tacticPerfData) {
                                                    if (tacticName === '')
                                                        for (var ndx in $scope.tacticList)
                                                            if (_tacticPerfData[i].id == $scope.tacticList[ndx].id)
                                                                tacticName=$scope.tacticList[ndx].description;
                                                    _tacticPerfData[i].description = tacticName;
                                                }
                                                _tacticsPerfList.push(_tacticPerfData);
                                                $scope.tacticsPerfDataListByScreen = _tacticsPerfList;
                                            }

                                            else {

                                                $scope.tacticScreenBusy = false;
                                            }
                                        });
                                    }

                                }
                            }
                        }
                    }

//                    } else {
//                        // No tactics for a given strategy
//                      //  $scope.noTacticsFound = true;
//                    }

                });
           // }
        };

        $scope.strategyPerformanceData = function (param) {

            if ($scope.selected_filters.tab === 'bydaysofweek'){
              //  console.log("days of week tab");
                if($scope.strategyPerfDataByDOW ==='undefined' || $scope.strategyPerfDataByDOW.length === 0 ){
                //    console.log("inside days of week tab");
                    $scope.dowBusy = true;
                    $scope.tacticDowBusy = true;
                    performanceService.getStrategyPerfData(param).then(function (result) {
                        if (result.status === "OK" || result.status === "success") {
                            $scope.strategyPerfDataByDOW = result.data.data;
                            $scope.dowBusy = false ;
                            $scope.tacticPerfData(param);
                        }
                        else {
                            $scope.dataNotFoundForDOW = true;
                            $scope.dowBusy = false ;
                            $scope.tacticDowBusy = false ;
                        }
                    });

                    // **********************************************************************
                    // load other screen tabs strategy data.
                    //************************************************************************
//                    if ($scope.firstTime || $scope.strategyPerfDataByScreen ==='undefined' || $scope.strategyPerfDataByScreen.length === 0) {
//
//                        var formatParamsForStrategy = {
//                            campaignId: $scope.selectedCampaign.id,
//                            strategyId: $scope.selectedStrategy.id,
//                            strategyStartDate: $scope.selectedStrategy.startDate,
//                            strategyEndDate: $scope.selectedStrategy.endDate,
//                            tab: "byscreens",  //bydaysofweek
//                            timeFilter: $scope.selected_filters.time_filter
//                        };
//
//                        performanceService.getStrategyPerfData(formatParamsForStrategy).then(function (result) {
//                            console.log("got strategy data fo screens ");
//                            if (result.status === "OK" || result.status === "success") {
//                                $scope.strategyPerfDataByScreen = result.data.data;
//                                $scope.formatBusy = false;
//                                $scope.tacticPerfData(formatParamsForStrategy);
//                            }
//                            else {
//                                $scope.dataNotFoundForFormat = true;
//                                $scope.formatBusy = false;
//                                // $scope.dataNotFound = true;
//                            }
//                        });
//                        $scope.firstTime = false ;
//                        console.log("performance tunnings for screens tab successfull");
//                    }
                }

            } else if ($scope.selected_filters.tab === 'byformats' ){
               // console.log("by fromats tab");
               // console.log($scope.strategyPerfDataByFormat ==='undefined' || $scope.strategyPerfDataByFormat.length === 0);
                if($scope.strategyPerfDataByFormat ==='undefined' || $scope.strategyPerfDataByFormat.length === 0){
                    $scope.formatBusy = true;
                    $scope.tacticFormatBusy = true;
                    performanceService.getStrategyPerfData(param).then(function (result) {
                        if (result.status === "OK" || result.status === "success") {
                            $scope.strategyPerfDataByFormat = result.data.data;
                            $scope.dataNotFoundForFormat = false;
                            $scope.formatBusy = false ;
                            $scope.tacticPerfData(param);
                        }
                        else {
                            $scope.dataNotFoundForFormat = true;
                            $scope.formatBusy = false ;
                            $scope.tacticFormatBusy = false;

                        }
                    });

                }

            }  else if ($scope.selected_filters.tab === 'byscreens' ){

                //console.log("by screens tab");
                //console.log($scope.strategyPerfDataByScreen ==='undefined' || $scope.strategyPerfDataByScreen.length === 0);
                if($scope.strategyPerfDataByScreen ==='undefined' || $scope.strategyPerfDataByScreen.length === 0) {
                    $scope.screenBusy = true;
                    $scope.tacticScreenBusy = true ;

                    performanceService.getStrategyPerfData(param).then(function (result) {
                        if (result.status === "OK" || result.status === "success") {
                            $scope.strategyPerfDataByScreen = result.data.data;
                            $scope.dataNotFoundForScreen = false;
                            $scope.screenBusy = false;
                            $scope.tacticPerfData(param);
                        }
                        else {
                            $scope.dataNotFoundForScreen = true;
                            $scope.screenBusy = false;
                            $scope.tacticScreenBusy = false;

                        }
                    });

                }
            }
        };

        $scope.updateStrategyObjects = function (strategy) {

            $scope.strategies = strategy;
            $scope.performanceBusy = false ;
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
               // $scope.noTacticsFound = true;
                $scope.strategyFound = false;
                // $scope.dataNotFound = true;
            }
        };


        $scope.strategylist = function (campaignId) {
            $scope.performanceBusy = true ;
            $scope.selectedStrategy.name = "Loading...";
                domainReports.getCampaignStrategyList(campaignId).then(function (result) {
                    if (result.status == 'success') {
                        var strategy = result.data.data;
                        $scope.updateStrategyObjects(strategy);
                    } else {
                        $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
                    }
                    $scope.performanceBusy = false ;
                });
        };

        //This will be called from directive_controller.js
        $scope.callBackCampaignsSuccess = function () {
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
            $scope.init();
            if ($scope.selectedCampaign.id !== -1) {
                $scope.strategylist($scope.selectedCampaign.id);
                $scope.callBackCampaignsSuccess();
            } else {
                $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
                $scope.strategyFound = false ;
            }
           // $scope.$apply();
        };

        //Function is called from startegylist directive
        $scope.callBackStrategyChange = function () {
            //Call  to load with the changed campaign id and strategyid
           // $scope.init();
            //cleaning the list
            $scope.tacticList = [];
            $scope.strategyPerfDataByScreen = [];
            $scope.strategyPerfDataByFormat = [];
            $scope.strategyPerfDataByDOW = [];

            $scope.tacticsPerfDataListByScreen = [];
            $scope.tacticsPerfDataListByFormat = [];
            $scope.tacticsPerfDataListByDOW = [];

            $scope.dataNotFoundForScreen = false;
            $scope.dataNotFoundForFormat = false;
            $scope.dataNotFoundForDOW = false;

            if($scope.selectedStrategy.id == -1)
                $scope.strategyFound = false ;

           else {
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


        //TODO: This function is called from the directive, onchange of the dropdown.It will be done when dropdown is implemented.
        $scope.callBackKpiDurationChange = function (kpiType) {
            if (kpiType == 'duration') {
                $scope.strategyPerformanceData({campaignId: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, strategyStartDate: $scope.selectedStrategy.startDate, strategyEndDate: $scope.selectedStrategy.endDate, tab: $scope.selected_filters.tab, timeFilter: $scope.selected_filters.time_filter });
                dataTransferService.updateExistingStorageObjects({'filterDurationType': $scope.selected_filters.time_filter, 'filterDurationValue': $scope.selected_filters.time_filter_text});

                var urlPath = apiPaths.apiSerivicesUrl + '/campaigns/' + $scope.selectedCampaign.id + '/performance/';
                $scope.download_urls = {
                    screens: urlPath + 'screensandformats/download?date_filter=' + $scope.selected_filters.time_filter,
                    daysOfWeek: urlPath + 'daysofweek/download?date_filter=' + $scope.selected_filters.time_filter
                };
            } else {
                $scope.$apply();
                dataTransferService.updateExistingStorageObjects({'filterKpiType': $scope.selected_filters.kpi_type, 'filterKpiValue': $scope.selected_filters.kpi_type_text});
            }
        };

        $scope.$on(constants.EVENT_TIMEPERIOD_CHANGED, function(event) {
          $scope.callBackKpiDurationChange('duration');
        });

    });
}());