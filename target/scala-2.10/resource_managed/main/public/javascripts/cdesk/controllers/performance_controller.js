var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('performanceController', function ($scope, $window, performanceService, utils, dataTransferService, dataService, domainReports, apiPaths, constants, timePeriodModel, loginModel, analytics) {

        //Hot fix to show the campaign tab selected
        $(".main_navigation").find('.active').removeClass('active').end().find('#reports_nav_link').addClass('active');


        $scope.first_time_activity_loader = true ;

      //  $scope.selectedCampaign = domainReports.getDefaultValues()['campaign'];
     // intValues
     $scope.selectedCampaign = domainReports.intValues()['campaign'];
     $scope.selectedStrategy = domainReports.intValues()['strategy'];


      //  $scope.selectedStrategy = domainReports.getDefaultValues()['strategy'];

        $scope.selected_filters = domainReports.getDurationKpi();

        $scope.filters = domainReports.getReportsDropDowns();

        // We should not keep selected tab in $scope.selected_filters object because it is altered by directive_controller in callBackCampaingSuccess and then tab info is not set
        //TODO : save seelcted tab info in models.
        $scope.selected_tab = 'byscreens';

        $scope.performanceBusy = false;



        $scope.download_urls = {
            screens: null,
            daysOfWeek: null,
            platforms: null
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

            $scope.platformBusy = false;
            $scope.tacticPlatformBusy = false;

            $scope.strategies = {};

          //  $scope.firstTime = true;
           // $scope.noTacticsFound = false;

            $scope.tacticList = [];

            $scope.strategyPerfDataByScreen = [];
            $scope.strategyPerfDataByFormat = [];
            $scope.strategyPerfDataByDOW = [];
            $scope.strategyPerfDataByPlatform = [];

            $scope.tacticsPerfDataListByScreen = [];
            $scope.tacticsPerfDataListByFormat = [];
            $scope.tacticsPerfDataListByDOW = [];
            $scope.tacticsPerfDataListByPlatform = [];

            $scope.dataNotFoundForScreen = false;
            $scope.dataNotFoundForFormat = false;
            $scope.dataNotFoundForDOW = false;
            $scope.dataNotFoundForPlatform = false;
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
                                tab: $scope.selected_tab,
                                timeFilter: param.timeFilter
                            };

                            //     console.log("tactic list found");

                            if ($scope.selected_tab == 'bydaysofweek') {
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
                            } else if ($scope.selected_tab == 'byformats') {
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

                            } else if ($scope.selected_tab === 'byscreens') {
                                 //console.log("tactic by screens ");
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
                            } else if ($scope.selected_tab === 'byplatforms') {
                                // console.log($scope.tacticsPerfDataListByScreen);
                                // console.log($scope.tacticsPerfDataListByScreen ==='undefined' || $scope.tacticsPerfDataListByScreen.length === 0 );
                                if ($scope.tacticsPerfDataListByPlatform === 'undefined' || $scope.tacticsPerfDataListByPlatform.length === 0) {
                                    $scope.tacticPlatformBusy = true;
                                    for (var index in $scope.tacticList) {
                                        tacticParams.tacticId = $scope.tacticList[index].id;
                                        tacticParams.tacticName = $scope.tacticList[index].description;
                                        tacticParams.startDate = $scope.tacticList[index].startDate;
                                        tacticParams.endDate = $scope.tacticList[index].endDate;

                                        performanceService.getTacticPerfData(tacticParams).then(function (result) {
                                            if (result.status === "OK" || result.status === "success") {
                                                var _tacticPerfData = result.data.data;
                                                $scope.tacticPlatformBusy = false;
                                                var tacticName='';
                                                for (var i in _tacticPerfData) {
                                                    if (tacticName === '')
                                                        for (var ndx in $scope.tacticList) {
                                                            if (_tacticPerfData[i].id == $scope.tacticList[ndx].id)
                                                                tacticName = $scope.tacticList[ndx].description;
                                                        }
                                                    _tacticPerfData[i].description = tacticName;
                                                }
                                                _tacticsPerfList.push(_tacticPerfData);
                                                $scope.tacticsPerfDataListByPlatform = _tacticsPerfList;
                                            }

                                            else {

                                                $scope.tacticPlatformBusy = false;
                                            }
                                        });
                                    }

                                }
                            }

                        }
                    }


                });

        };

        $scope.strategyPerformanceData = function (param) {

            if ($scope.selected_tab === 'bydaysofweek'){

                analytics.track(loginModel.getUserRole(), constants.GA_PERF_DAYS_OF_WEEK, 'days_of_week', loginModel.getLoginName());

                if($scope.strategyPerfDataByDOW ==='undefined' || $scope.strategyPerfDataByDOW.length === 0 ){

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

            } else if ($scope.selected_tab === 'byformats' ){
               // console.log("by fromats tab");
               // console.log($scope.strategyPerfDataByFormat ==='undefined' || $scope.strategyPerfDataByFormat.length === 0);

                analytics.track(loginModel.getUserRole(), constants.GA_PERF_FORMATS, 'formats', loginModel.getLoginName());

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

            }  else if ($scope.selected_tab === 'byscreens' ){
                //console.log($scope.strategyPerfDataByScreen ==='undefined' || $scope.strategyPerfDataByScreen.length === 0);

                analytics.track(loginModel.getUserRole(), constants.GA_PERF_SCREENS, 'screens', loginModel.getLoginName());

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
            }  else if ($scope.selected_tab === 'byplatforms' ){
                //console.log($scope.strategyPerfDataByScreen ==='undefined' || $scope.strategyPerfDataByScreen.length === 0);
                analytics.track(loginModel.getUserRole(), constants.GA_PERF_PLATFORMS, 'platforms', loginModel.getLoginName());

                if($scope.strategyPerfDataByPlatform ==='undefined' || $scope.strategyPerfDataByPlatform.length === 0) {
                    $scope.platformBusy = true;
                    $scope.tacticPlatformBusy = true ;

                    performanceService.getStrategyPerfData(param).then(function (result) {
                        if (result.status === "OK" || result.status === "success") {
                            $scope.strategyPerfDataByPlatform = result.data.data;
                            $scope.dataNotFoundForPlatform = false;
                            $scope.platformBusy = false;
                            $scope.tacticPerfData(param);
                        }
                        else {
                            $scope.dataNotFoundForPlatform = true;
                            $scope.platformBusy = false;
                            $scope.tacticPlatformBusy = false;

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
                    $scope.strategyPerformanceData({campaignId: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, strategyStartDate: $scope.selectedStrategy.startDate, strategyEndDate: $scope.selectedStrategy.endDate, tab: $scope.selected_tab, timeFilter: $scope.selected_filters.time_filter });
                }
            } else { //  means empty strategy list
                $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
               // $scope.noTacticsFound = true;
                $scope.strategyFound = false;
                $scope.strategies = {} ; // clear the strategy list if no strategy found
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
                $scope.first_time_activity_loader = false ;
            });
        };

        //This will be called from directive_controller.js
        $scope.callBackCampaignsSuccess = function () {
            var urlPath = apiPaths.apiSerivicesUrl + '/campaigns/' + $scope.selectedCampaign.id + '/performance/';

            $scope.download_urls = {
                screens: urlPath + 'screensandformats/reportDownload?date_filter=' + $scope.selected_filters.time_filter,
                daysOfWeek: urlPath + 'daysofweek/reportDownload?date_filter=' + $scope.selected_filters.time_filter,
                platforms: urlPath + 'platforms/reportDownload?date_filter=cdb_period'
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
                $scope.strategies = {} ; // if No Strategy then clear the strategy list.
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
            $scope.strategyPerfDataByPlatform = [];


            $scope.tacticsPerfDataListByScreen = [];
            $scope.tacticsPerfDataListByFormat = [];
            $scope.tacticsPerfDataListByDOW = [];
            $scope.tacticsPerfDataListByPlatform = [];


            $scope.dataNotFoundForScreen = false;
            $scope.dataNotFoundForFormat = false;
            $scope.dataNotFoundForDOW = false;
            $scope.dataNotFoundForPlatform = false;
            $scope.perfReportDownloadBusy = false;

            if($scope.selectedStrategy.id == -1){
                $scope.strategyFound = false ;
                $scope.strategies = {} ; // if No Strategy then clear the strategy list.
            } else {
                $scope.strategyPerformanceData({campaignId: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, strategyStartDate: $scope.selectedStrategy.startDate, strategyEndDate: $scope.selectedStrategy.endDate, tab: $scope.selected_tab, timeFilter: $scope.selected_filters.time_filter });
                analytics.track(loginModel.getUserRole(), constants.GA_USER_STRATEGY_SELECTION, $scope.selectedStrategy.name, loginModel.getLoginName());
            }
        };

        $(document).ready(function () {
            $(".each_tab").click(function () {
                var tab_id = $(this).attr("id").split("_tab")
                $scope.selected_tab = tab_id[0];
                $(".reports_tabs_holder").find(".active").removeClass("active");
                $(this).addClass("active");
                $(".reports_block").hide();
                $("#reports_" + tab_id[0] + "_block").show();
                $scope.strategyPerformanceData({campaignId: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, strategyStartDate: $scope.selectedStrategy.startDate, strategyEndDate: $scope.selectedStrategy.endDate, tab: $scope.selected_tab, timeFilter: $scope.selected_filters.time_filter });
            });
        });


        //TODO: This function is called from the directive, onchange of the dropdown.It will be done when dropdown is implemented.
        $scope.callBackKpiDurationChange = function (kpiType) {
            if (kpiType == 'duration') {
                $scope.strategyPerformanceData({campaignId: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, strategyStartDate: $scope.selectedStrategy.startDate, strategyEndDate: $scope.selectedStrategy.endDate, tab: $scope.selected_tab, timeFilter: $scope.selected_filters.time_filter });
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

        $scope.downloadPerformanceReport = function(report_url, report_name) {
            $scope.perfReportDownloadBusy = true;
            var report_url1 = report_url ;
            if (report_name==='by_platforms')
                report_url1=report_url+'&start_date='+$scope.selectedStrategy.startDate+'&end_date='+$scope.selectedStrategy.endDate ;
            dataService.downloadFile(report_url1).then(function(response) {
                if(response.status === "success"){
                    $scope.perfReportDownloadBusy = false;
                    saveAs(response.file, response.fileName);
                } else if (response.status === "error") {
                    $scope.perfReportDownloadBusy = false;
                }
            });
            analytics.track(loginModel.getUserRole(), constants.GA_DOWNLOAD_REPORT, 'performance_' + report_name + '_report', loginModel.getLoginName());
        }

    });
}());
