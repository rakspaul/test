var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('performanceController', function ($rootScope, $scope, $window, campaignSelectModel, strategySelectModel, kpiSelectModel, performanceService, utils, dataService, domainReports, apiPaths, constants, timePeriodModel, loginModel, analytics) {

        //Hot fix to show the campaign tab selected
        $(".main_navigation").find('.active').removeClass('active').end().find('#reports_nav_link').addClass('active');
        $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign() ;

        $scope.getMessageForPerfDataNotAvailable = function (dataSetType) {
            if ( campaignSelectModel.durationLeft() == 'Yet to start')
                return constants.MSG_CAMPAIGN_YET_TO_START;
            else if (campaignSelectModel.daysSinceEnded() > 1000)
                return constants.MSG_CAMPAIGN_VERY_OLD;
            else if ( $scope.selectedCampaign.kpi =='null')
                return constants.MSG_CAMPAIGN_KPI_NOT_SET;
//            else if (campaign.status == 'active')
//                return constants.MSG_CAMPAIGN_ACTIVE_BUT_NO_DATA;
            else
                return constants.MSG_DATA_NOT_AVAILABLE;
        };


        $scope.selectedStrategy = strategySelectModel.getSelectedStrategy(); //domainReports.intValues()['strategy'];


        $scope.filters = domainReports.getReportsDropDowns();

        // We should not keep selected tab in $scope.selected_filters object because it is altered by directive_controller in callBackCampaingSuccess and then tab info is not set
        $scope.selected_tab = 'byscreens';

        $scope.sortByColumn = 'description';

        $scope.strategyLoading =  true;
        $scope.strategyFound = true;

        $scope.download_urls = {
            screens: null,
            daysOfWeek: null,
            platforms: null
        };

        var platform_icon_map= {
            'Facebook':'http://erickmotta.com/wp-content/uploads/2014/09/facebook-icon.png',
            'Everyscreen Media':'http://www.mmaglobal.com/files/styles/member_logo_large/public/epsfield_images/logos/dstillery.png?itok=ZGn3AUo7',
            'ATT Network':'http://www.att.com/favicon.ico',
            'DoubleClick Bid Manager':'assets/images/platform_logos/double_logo.png',
            'AppNexus':'http://adap.tv/favicon.ico',
            'Telemetry':'assets/images/platform_logos/telemetry_logo.png',
            'Collective Bidder':'assets/images/platform_logos/collective_logo.png',
            'Collective Publishers':'assets/images/platform_logos/collective_logo.png',
            'Adap.tv':'http://adap.tv/favicon.ico',
            'Google Ad Exchange':'http://marketingland.com/wp-content/ml-loads/2013/06/doubleclick-icon.jpg',
            'Prog_Mechanics':'',
            'Yahoo Ad Exchange':'http://www.yahoo.com/favicon.ico',
            'TriVu Media - YouTube':'assets/images/platform_logos/trivumedia_logo.png',
            'Admeld':'http://marketingland.com/wp-content/ml-loads/2013/06/doubleclick-icon.jpg',
            'Beanstock':'assets/images/platform_logos/beanstock_logo.png',
            'LiveRail':'assets/images/platform_logos/liverail_logo.png',
            'OpenX':'http://openx.com/favicon.ico',
            'Pubmatic':'http://www.pubmatic.com/favicon.ico',
            'Rubicon':'',
            'Miscellaneous':'assets/images/platform_logos/platform_logo.png',
            'Microsoft':'http://www.msn.com/favicon.ico'
            }
        $scope.getPlatformIcon=function(platformName) {
            var pIcon=platform_icon_map[platformName];
            return (pIcon!== undefined && pIcon!=='')  ? pIcon:platform_icon_map['Miscellaneous'];
        }
        $scope.init= function(){

            $scope.strategyFound = false ;

            $scope.screenBusy = false;
            $scope.tacticScreenBusy = false ;

            $scope.formatBusy = false;
            $scope.tacticFormatBusy = false;

            $scope.dowBusy = false;
            $scope.tacticDowBusy = false ;

            $scope.platformBusy = true;
            $scope.tacticPlatformBusy = false;
            $scope.isStrategyDataEmpty = false;


            $scope.strategies = {};

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

            $scope.selected_filters = {};
            $scope.selected_filters.time_filter = 'life_time'; //
            $scope.selected_filters.campaign_default_kpi_type =  kpiSelectModel.getSelectedKpi();
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
                                    }, function() {
                                        $scope.tacticDowBusy = false;
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
                                    }, function() {
                                        $scope.tacticFormatBusy = false;
                                    });
                                }
                            }

                        } else if ($scope.selected_tab === 'byscreens') {

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
                                    }, function() {
                                        $scope.tacticScreenBusy = false;
                                    });
                                }

                            }
                        } else if ($scope.selected_tab === 'byplatforms') {
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
                                    }, function() {
                                        $scope.tacticPlatformBusy = false;
                                    });
                                }

                            }
                        }

                    }
                }
            });
        };


        $scope.strategyPerformanceData = function (param) {

            $scope.screenBusy = true;
            $scope.platformBusy = true;
            $scope.formatBusy = true;
            $scope.dowBusy = true;
            $scope.getStrategyDataForOtherTabs =  function() { //for days of week, Formats, Platforms
                if ($scope.selected_tab === 'bydaysofweek'){
                    if($scope.strategyPerfDataByDOW ==='undefined' || $scope.strategyPerfDataByDOW.length === 0 ){
                        $scope.tacticDowBusy = false;
                        var bydaysofweekError= function() {
                            $scope.dataNotFoundForDOW = true;
                            $scope.dowBusy = false ;
                            $scope.tacticDowBusy = false ;
                        }
                        performanceService.getStrategyPerfData(param).then(function (result) {
                            if (result.status === "OK" || result.status === "success") {
                                $scope.strategyPerfDataByDOW = result.data.data;
                                $scope.dowBusy = false ;
                                if(param.strategyId) {
                                    $scope.tacticDowBusy = true ;
                                    $scope.tacticPerfData(param);
                                }
                            }
                            else {
                                bydaysofweekError();
                            }
                        }, bydaysofweekError);
                    }
                    analytics.track(loginModel.getUserRole(), constants.GA_PERF_DAYS_OF_WEEK, 'days_of_week', loginModel.getLoginName());

                } else if ($scope.selected_tab === 'byformats' ){
                    if($scope.strategyPerfDataByFormat ==='undefined' || $scope.strategyPerfDataByFormat.length === 0){
                        $scope.tacticFormatBusy = false;
                        var byformatsError =  function() {
                            $scope.dataNotFoundForFormat = true;
                            $scope.formatBusy = false ;
                            $scope.tacticFormatBusy = false;
                        }
                        performanceService.getStrategyPerfData(param).then(function (result) {
                            if (result.status === "OK" || result.status === "success") {
                                $scope.strategyPerfDataByFormat = result.data.data;
                                $scope.dataNotFoundForFormat = false;
                                $scope.formatBusy = false ;
                                //$scope.checkForSelectedTabData($scope.strategyPerfDataByFormat, 'Format');
                                if(param.strategyId) {
                                    $scope.tacticFormatBusy = true ;
                                    $scope.tacticPerfData(param);
                                }
                            }
                            else {
                                byformatsError();
                            }
                        }, byformatsError);

                    }
                    analytics.track(loginModel.getUserRole(), constants.GA_PERF_FORMATS, 'formats', loginModel.getLoginName());
                }   else if ($scope.selected_tab === 'byplatforms' ){
                    if(typeof $scope.strategyPerfDataByPlatform === 'undefined' || $scope.strategyPerfDataByPlatform.length === 0) {
                        $scope.tacticPlatformBusy = false ;
                        var byplatformsError = function() {
                            $scope.dataNotFoundForPlatform = true;
                            $scope.platformBusy = false;
                            $scope.tacticPlatformBusy = false;
                        }
                        performanceService.getStrategyPerfData(param).then(function (result) {
                            if (result.status === "OK" || result.status === "success") {
                                $scope.strategyPerfDataByPlatform = result.data.data;
                                $scope.dataNotFoundForPlatform = false;
                                $scope.platformBusy = false;
                                //$scope.checkForSelectedTabData($scope.strategyPerfDataByPlatform, 'Platform');
                                if(param.strategyId) {
                                    $scope.tacticPlatformBusy = true ;
                                    $scope.tacticPerfData(param);
                                }
                            }
                            else {
                                byplatformsError();
                            }
                        }, byplatformsError);
                    }
                    analytics.track(loginModel.getUserRole(), constants.GA_PERF_PLATFORMS, 'platforms', loginModel.getLoginName());
                }
            };

            $scope.checkForSelectedTabData =  function(data, tab) {

                if($scope.selectedCampaign.kpi && !$scope.isStrategyDataEmpty) {
                    var screenTotal = 0;
                    _.each(data, function (screen) {
                        if (screen.dimension.toLowerCase() == 'smartphone' || screen.dimension.toLowerCase() == 'tablet' || screen.dimension.toLowerCase() == 'desktop') {
                            if (screen[$scope.selectedCampaign.kpi.toLowerCase()] > 0) {
                                screenTotal += screen[$scope.selectedCampaign.kpi.toLowerCase()];
                            }
                        }
                    });
                    if(screenTotal === 0) {
                        $scope.strategyFound = false;
                    }
                }
            };


            $scope.getStrategyScreenData = function(param) {
                var queryData = $.extend({},param);
                if($scope.strategyPerfDataByScreen ==='undefined' || $scope.strategyPerfDataByScreen.length === 0) {
                    $scope.tacticScreenBusy = false ;
                    var byscreensError = function() {
                        $scope.dataNotFoundForScreen = true;
                        $scope.screenBusy = false;
                        $scope.tacticScreenBusy = false;
                        $scope.strategyFound = false;
                    }

                    queryData['tab'] = 'byscreens';
                    performanceService.getStrategyPerfData(queryData).then(function (result) {
                        if (result.status === "OK" || result.status === "success") {
                            $scope.strategyPerfDataByScreen = result.data.data;
                            $scope.checkForSelectedTabData($scope.strategyPerfDataByScreen, 'Screen');
                            $scope.screenBusy = false;
                            $scope.isStrategyDataEmpty = true;
                            if(queryData.strategyId) {
                                $scope.tacticScreenBusy = true ;
                                $scope.tacticPerfData(queryData);
                            }
                            if($scope.strategyFound && $scope.selected_tab !== 'byscreens') {
                                $scope.getStrategyDataForOtherTabs();
                            }
                        }
                        else {
                            byscreensError();
                        }
                    }, byscreensError);
                }
            }
            //default calling screen strategy
            if(!$scope.isStrategyDataEmpty || $scope.selected_tab === 'byscreens') {
                $scope.getStrategyScreenData(param);
            } else {
                $scope.getStrategyDataForOtherTabs();
            }
        };


        $scope.$on(constants.EVENT_CAMPAIGN_CHANGED , function(event,campaign){
            $scope.init();
            $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign();  //update the selected Campaign
            $scope.callBackCampaignsSuccess();
        });

        $scope.$on(constants.EVENT_STRATEGY_CHANGED , function(event,strategy){
            $scope.selectedStrategy.id =  strategySelectModel.getSelectedStrategy().id ;
            $scope.selectedStrategy.name = strategySelectModel.getSelectedStrategy().name ;
            $scope.strategyHeading = Number($scope.selectedStrategy.id) === 0 ? 'Campaign total' : 'Strategy total';
            $scope.isStrategyDataEmpty = false;
            $scope.callBackStrategyChange();
        });

        //This will be called from directive_controller.js
        $scope.callBackCampaignsSuccess = function () {
            var urlPath = apiPaths.apiSerivicesUrl + '/campaigns/' + $scope.selectedCampaign.id + '/performance/';
            $scope.download_urls = {
                screens: urlPath + 'screensandformats/reportDownload?date_filter=' + $scope.selected_filters.time_filter,
                daysOfWeek: urlPath + 'daysofweek/reportDownload?date_filter=' + $scope.selected_filters.time_filter,
                platforms: urlPath + 'platforms/reportDownload?date_filter=cdb_period'
            };
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
            if($scope.selectedStrategy.id == -99 ||$scope.selectedStrategy.id == -1  ){
                $scope.strategyFound = false ;
            } else {
                $scope.strategyFound = true;

                $scope.strategyPerformanceData({
                    campaignId: $scope.selectedCampaign.id,
                    strategyId: Number($scope.selectedStrategy.id),
                    strategyStartDate: $scope.selectedCampaign.startDate,
                    strategyEndDate: $scope.selectedCampaign.endDate,
                    tab: $scope.selected_tab,
                    timeFilter: $scope.selected_filters.time_filter
                });
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
                $scope.callBackStrategyChange();
                //$scope.strategyPerformanceData({campaignId: $scope.selectedCampaign.id, strategyId: Number($scope.selectedStrategy.id), strategyStartDate: $scope.selectedCampaign.startDate, strategyEndDate: $scope.selectedCampaign.endDate, tab: $scope.selected_tab, timeFilter: $scope.selected_filters.time_filter });
            });
        });


        //TODO: This function is called from the directive, onchange of the dropdown.It will be done when dropdown is implemented.
        $scope.callBackKpiDurationChange = function (kpiType) {
//            if (kpiType == 'duration') {
//                $scope.strategyPerformanceData({campaignId: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, strategyStartDate: $scope.selectedCampaign.startDate, strategyEndDate: $scope.selectedCampaign.endDate, tab: $scope.selected_tab, timeFilter: $scope.selected_filters.time_filter });
//                dataTransferService.updateExistingStorageObjects({'filterDurationType': $scope.selected_filters.time_filter, 'filterDurationValue': $scope.selected_filters.time_filter_text});
//
//                var urlPath = apiPaths.apiSerivicesUrl + '/campaigns/' + $scope.selectedCampaign.id + '/performance/';
//                $scope.download_urls = {
//                    screens: urlPath + 'screensandformats/download?date_filter=' + $scope.selected_filters.time_filter,
//                    daysOfWeek: urlPath + 'daysofweek/download?date_filter=' + $scope.selected_filters.time_filter
//                };
//            } else {
//                $scope.$apply();
//                dataTransferService.updateExistingStorageObjects({'filterKpiType': $scope.selected_filters.kpi_type, 'filterKpiValue': $scope.selected_filters.kpi_type_text});
//            }
        };

        $scope.$on(constants.EVENT_TIMEPERIOD_CHANGED, function(event) {
            $scope.callBackKpiDurationChange('duration');
        });


        $scope.$on(constants.EVENT_KPI_CHANGED, function(e) {

            if($scope.selected_filters == undefined)
                $scope.selected_filters = {} ;

            $scope.selected_filters.kpi_type = kpiSelectModel.getSelectedKpi();
           // $scope.$apply();

        });


        $scope.downloadPerformanceReport = function(report_url, report_name) {
            if (!loginModel.cookieExists())
                loginModel.checkCookieExpiry();
            else {
                $scope.perfReportDownloadBusy = true;
                var report_url1 = report_url;
                if (report_name === 'by_platforms')
                    report_url1 = report_url + '&start_date=' + $scope.selectedCampaign.startDate + '&end_date=' + $scope.selectedCampaign.endDate;
                dataService.downloadFile(report_url1).then(function (response) {
                    if (response.status === "success") {
                        $scope.perfReportDownloadBusy = false;
                        saveAs(response.file, response.fileName);
                    } else {
                        $scope.perfReportDownloadBusy = false;
                    }
                }, function() {
                    $scope.perfReportDownloadBusy = false;
                }, function() {
                    $scope.perfReportDownloadBusy = false;
                });
                analytics.track(loginModel.getUserRole(), constants.GA_DOWNLOAD_REPORT, 'performance_' + report_name + '_report', loginModel.getLoginName());
            }
        }

    });
}());