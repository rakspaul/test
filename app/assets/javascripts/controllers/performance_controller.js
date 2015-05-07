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

        $scope.filters = domainReports.getReportsTabs();

        // We should not keep selected tab in $scope.selected_filters object because it is altered by directive_controller in callBackCampaingSuccess and then tab info is not set
        $scope.selected_tab = 'byscreens';
        $scope.sortByColumn = 'name';

        $scope.strategyLoading =  true;
        $scope.strategyFound = true;
        var performaceTabMap = [ {'byscreens' : 'Screen'}, {'byformats' : 'Format'}, {'byplatforms' : 'Platform'}, {'bydaysofweek' : 'DOW'}];

        $scope.download_urls = {
            screens: null,
            daysOfWeek: null,
            platforms: null
        };

        $scope.init= function(){

            $scope.strategyFound = false ;
            $scope.screenBusy = false;
            $scope.formatBusy = false;
            $scope.dowBusy = false;

            $scope.platformBusy = true;
            $scope.isStrategyDataEmpty = false;
            $scope.hidePerformanceReportTab = false;
            $scope.api_return_code = 200;

            $scope.strategies = {};

            $scope.strategyPerfDataByScreen = [];
            $scope.strategyPerfDataByFormat = [];
            $scope.strategyPerfDataByDOW = [];
            $scope.strategyPerfDataByPlatform = [];

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
        $scope.strategyPerformanceData = function (param) {

            $scope.screenBusy = true;
            $scope.platformBusy = true;
            $scope.formatBusy = true;
            $scope.dowBusy = true;

            var tabName, tabsList;

            this.errorHandlerForPerformanceTab = function(result, listOfTabs) {
                var listOfTabArr = listOfTabs.split(',');
                if (result && result.data && result.status ==='error') {
                    $scope.api_return_code = result.data.status;
                }
                $.each(listOfTabArr , function(idx, tab) {
                    $scope['dataNotFoundFor'+tab] = true;
                    $scope[tab.toLowerCase() + 'Busy'] = false;
                })
            }

            this.checkForSelectedTabData =  function(data, tab) {
                var totalImpression = _.reduce(data, function(sum, d) { return sum + d.impressions  }, 0);
                return totalImpression === 0;
            };

            this.getPerformanceData = function(tab, listOfTabs) {
                var strategyPerfData = $scope['strategyPerfDataBy'+tab];
                if(strategyPerfData ==='undefined' || strategyPerfData.length === 0 ) {
                    $scope.api_return_code=200;
                    var StrategyFunc = performanceService[tab !== 'Platform' ? 'getStrategyPerfData' : 'getStrategyPlatformData'];
                    StrategyFunc(param).then(function (result) {
                        if (result.status === "OK" || result.status === "success") {

                            if (tab !== 'Platform')
                                $scope.hidePerformanceReportTab = $scope.checkForSelectedTabData(result.data.data[0].perf_metrics, tab);
                            else
                                $scope.hidePerformanceReportTab = $scope.checkForSelectedTabData(result.data.data, tab);
                            if($scope.hidePerformanceReportTab) {
                                $scope.errorHandlerForPerformanceTab(result, listOfTabs);
                            } else {

                                if (tab !== 'Platform')
                                    $scope['strategyPerfDataBy' + tab] = result.data.data[0];
                                else
                                    $scope['strategyPerfDataBy' + tab] = result.data.data;
                                $scope['dataNotFoundFor' + tab] = false;
                                $scope[tab.toLowerCase() + 'Busy'] = false;
                            }
                        }
                        else {
                            $scope.errorHandlerForPerformanceTab(result, listOfTabs);
                        }
                    }, $scope.errorHandlerForPerformanceTab, listOfTabs);
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
            $scope.strategyPerfDataByScreen = [];
            $scope.strategyPerfDataByFormat = [];
            $scope.strategyPerfDataByDOW = [];
            $scope.strategyPerfDataByPlatform = [];


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
