var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('performanceController', function ($rootScope, $scope, $window, campaignSelectModel, strategySelectModel, kpiSelectModel, performanceService, utils, dataService, domainReports, apiPaths, constants, timePeriodModel, loginModel, analytics, $timeout) {

        //Hot fix to show the campaign tab selected
        $(".main_navigation").find('.active').removeClass('active').end().find('#reports_nav_link').addClass('active');
        $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign() ;
        $scope.selectedStrategy = strategySelectModel.getSelectedStrategy(); //domainReports.intValues()['strategy'];

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
//            else if (campaign.status == 'active')
//                return constants.MSG_CAMPAIGN_ACTIVE_BUT_NO_DATA;
            else
                return constants.MSG_DATA_NOT_AVAILABLE;
        };

        $scope.filters = domainReports.getReportsDropDowns();

        // We should not keep selected tab in $scope.selected_filters object because it is altered by directive_controller in callBackCampaingSuccess and then tab info is not set
        $scope.selected_tab = 'byscreens';

        $scope.sortByColumn = 'description';

        $scope.strategyLoading =  true;
        $scope.strategyFound = true;
        var performaceTabMap = [ {'byscreens' : 'Screen'}, {'byformats' : 'Format'}, {'byplatforms' : 'Platform'}, {'bydaysofweek' : 'DOW'}];

        $scope.download_urls = {
            screens: null,
            daysOfWeek: null,
            platforms: null
        };

        var platform_icon_map= {
            'Facebook':'',
            'Everyscreen Media':'assets/images/platform_logos/dstillery_logo.png',
            'ATT Network':'https://www.att.com/favicon.ico',
            'DoubleClick':'assets/images/platform_logos/double_logo.png',
            'AppNexus':'assets/images/platform_logos/appnexus_logo.png',
            'Telemetry':'assets/images/platform_logos/telemetry_logo.png',
            'Collective Bidder':'assets/images/platform_logos/collective_logo.png',
            'Collective Publishers':'assets/images/platform_logos/collective_logo.png',
            'Adap.tv':'https://adap.tv/favicon.ico',
            'Google Ad Exchange':'assets/images/platform_logos/double_logo.png',
            'Prog_Mechanics':'',
            'Yahoo Ad Exchange':'https://www.yahoo.com/favicon.ico',
            'TriVu Media - YouTube':'assets/images/platform_logos/trivumedia_logo.png',
            'Admeld':'assets/images/platform_logos/double_logo.png',
            'Beanstock':'assets/images/platform_logos/beanstock_logo.png',
            'LiveRail':'assets/images/platform_logos/liverail_logo.png',
            'OpenX':'assets/images/platform_logos/openx_logo.png',
            'Pubmatic':'',
            'Rubicon':'assets/images/platform_logos/rubicon_logo.png',
            'Miscellaneous':'assets/images/platform_logos/platform_logo.png',
            'Collective Test Media':'assets/images/platform_logos/collective_logo.png',
            'Microsoft':'https://www.msn.com/favicon.ico'
            };

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
            $scope.hidePerformanceReportTab = false;
            $scope.api_return_code = 200;

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

        $scope.shortTabName =  function() {
            var selectedtab = $scope.selected_tab;
            return _.filter(performaceTabMap, function(obj) { return obj[selectedtab]})[0][selectedtab];
        };

        $scope.listOfShortTabName =  function() {
            return _.map(performaceTabMap, function(obj) { return _.values(obj) }).join(',');
        };

        $scope.init();
        $scope.tacticPerfData = function (param) {
            $scope.api_return_code=200;

            performanceService.getTacticsForStrategy(param).then(function (result) {
                if (result.status === "OK" || result.status === "success") {
                    $scope.tacticList = result.data.data;
                    //added index to tacticList array
                    _.each($scope.tacticList, function(obj, i) { obj.indx = i });
                    var tacticParams,
                        tabName,
                        tabsList;

                    var _cbTacticPerfData = function(resData, tab) {
                        var _tacticPerfData = resData.data.data,
                        _tacticsPerfList = [];
                        var urlIndex = resData.urlIndex;
                        var tacticName='';
                        for (var i in _tacticPerfData) {
                            if (tacticName === '') {
                                var data = _tacticPerfData[i];
                                for (var ndx in $scope.tacticList) {
                                    if (data.id == $scope.tacticList[ndx].id) {
                                        tacticName = $scope.tacticList[ndx].description;
                                    }
                                }
                                _tacticPerfData[i].description = tacticName;
                            }
                        }

                        _tacticsPerfList.push(_tacticPerfData);
                        $scope['tactic'+(tab.substr(0, 1).toUpperCase() + tab.substr(1).toLowerCase())+'Busy'] = false;
                        $scope.tacticList[urlIndex]['tacticsPerfDataListBy'+tab] =  _tacticsPerfList;
                    }

                    var getTacticPerfData =  function(tab) {
                        var tacticsPerfDataListByTab = $scope['tacticsPerfDataListBy'+tab];
                        var tacticPerfDataList = [];
                        if (typeof tacticsPerfDataListByTab === 'undefined' || tacticsPerfDataListByTab.length === 0) {
                            $scope['tactic'+(tab.substr(0, 1).toUpperCase() + tab.substr(1))+'Busy'] = true;
                            for (var index in $scope.tacticList) {
                                tacticParams.tacticId = $scope.tacticList[index].id;
                                tacticParams.tacticName = $scope.tacticList[index].description;
                                tacticParams.startDate = $scope.tacticList[index].startDate;
                                tacticParams.endDate = $scope.tacticList[index].endDate;
                                tacticParams.urlIndex = index;
                                performanceService.getTacticPerfData(tacticParams).then(function (result) {
                                    if (result.status === "OK" || result.status === "success") {
                                        _cbTacticPerfData(result, tab)
                                    } else {
                                        $scope['tactic'+(tab.substr(0, 1).toUpperCase() + tab.substr(1).toLowerCase())+'Busy'] = false;
                                    }
                                }, function() {
                                    $scope['tactic'+(tab.substr(0, 1).toUpperCase() + tab.substr(1).toLowerCase())+'Busy'] = false;
                                });
                            }
                        }
                    }
                    if (typeof $scope.tacticList !== 'undefined') {
                        tacticParams = { campaignId: param.campaignId, strategyId: param.strategyId,tacticId: '', tacticName: '', startDate: '', endDate: '', tab: $scope.selected_tab,timeFilter: param.timeFilter};
                        tabName = $scope.shortTabName();
                        tabsList = $scope.listOfShortTabName();
                        getTacticPerfData(tabName);
                    }
                }  else {
                        $scope.api_return_code = result.data.status;
                }
            });
        };


        $scope.strategyPerformanceData = function (param) {

            $scope.screenBusy = true;
            $scope.platformBusy = true;
            $scope.formatBusy = true;
            $scope.dowBusy = true;

            var tabName, tabsList;

            this.errorHandlerForPerformanceTab = function(result, tabsList) {
                var listOfTabArr = tabsList.split(',');
                if (result && result.data && result.status ==='error') {
                    $scope.api_return_code = result.data.status;
                }
                $.each(listOfTabArr , function(idx, tab) {
                    $scope['dataNotFoundFor'+tab] = true;
                    $scope[tab.toLowerCase() + 'Busy'] = false;
                    $scope['tactic'+(tab.substr(0, 1).toUpperCase() + tab.substr(1).toLowerCase())+'Busy'] = false;
                })
            }

            this.checkForSelectedTabData =  function(data, tab) {
                var totalImpression = _.reduce(data, function(sum, d) { return sum + d.impressions  }, 0);
                return totalImpression === 0 ?  true : false;
            };

            this.getPerformanceData = function(tab, tabsList) {
                var strategyPerfData = $scope['strategyPerfDataBy'+tab];
                if(strategyPerfData ==='undefined' || strategyPerfData.length === 0 ) {
                    $scope['tactic'+(tab.substr(0, 1).toUpperCase() + tab.substr(1))+'Busy'] = false;
                    $scope.api_return_code=200;
                    var StrategyFunc = performanceService[tab !== 'Platform' ? 'getStrategyPerfData' : 'getStrategyPlatformData'];
                    StrategyFunc(param).then(function (result) {
                        if (result.status === "OK" || result.status === "success") {
                            $scope.hidePerformanceReportTab = $scope.checkForSelectedTabData(result.data.data, tab);
                            if($scope.hidePerformanceReportTab) {
                                $scope.errorHandlerForPerformanceTab(result, tabsList);
                            } else {
                                $scope['strategyPerfDataBy' + tab] = result.data.data;
                                $scope['dataNotFoundFor' + tab] = false;
                                $scope[tab.toLowerCase() + 'Busy'] = false;
                                if (param.strategyId && tab !== 'Platform') {
                                    $scope['tactic' + (tab.substr(0, 1).toUpperCase() + tab.substr(1).toLowerCase()) + 'Busy'] = true;
                                    $scope.tacticPerfData(param);
                                }
                            }
                        }
                        else {
                            $scope.errorHandlerForPerformanceTab(result, tabsList);
                        }
                    }, $scope.errorHandlerForPerformanceTab, tabsList);
                }
            }

            tabName = $scope.shortTabName();
            tabsList = $scope.listOfShortTabName();
            if(!$scope.hidePerformanceReportTab) {
                this.getPerformanceData(tabName, tabsList);
            } else {
                $timeout(function() { // if campaign don't have data for performance tab, to handle strategy drop down selection we need to put some delay.
                    $scope.errorHandlerForPerformanceTab('', tabsList);
                }, 300)
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
