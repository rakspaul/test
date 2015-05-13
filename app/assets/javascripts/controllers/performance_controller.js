var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('performanceController', function ($rootScope, $scope, $window, campaignSelectModel, strategySelectModel, kpiSelectModel, performanceService, utils, dataService, domainReports, apiPaths, constants, timePeriodModel, loginModel, analytics, $timeout) {

        //highlight the header menu - Dashborad, Campaigns, Reports
        domainReports.highlightHeaderMenu();

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

        $scope.checkForSelectedTabData =  function(data, tab) {
            var totalImpression = _.reduce(data, function(sum, d) { return sum + d.impressions  }, 0);
            return totalImpression === 0;
        };

        $scope.getPerformanceData =  function() {
            var param = {
                campaignId: $scope.selectedCampaign.id,
                strategyId: Number($scope.selectedStrategy.id),
                strategyStartDate: $scope.selectedCampaign.startDate,
                strategyEndDate: $scope.selectedCampaign.endDate,
                tab: $scope.selected_tab,
                timeFilter: $scope.selected_filters.time_filter
            }

            $scope.screenBusy = true;
            $scope.formatBusy = true;
            $scope.dowBusy = true;

            var tab = _.compact(_.pluck(performaceTabMap, [param.tab]))[0];

            var errorHandlerForPerformanceTab = function() {
                $scope.dataNotFoundForScreen = true;
                $scope.dataNotFoundForFormat = true;
                $scope.dataNotFoundForDOW = true;
            }

            $scope.api_return_code=200;

            performanceService.getStrategyPerfData(param).then(function (result) {
                if (result.status === "OK" || result.status === "success") {
                    $scope.hidePerformanceReportTab = $scope.checkForSelectedTabData(result.data.data[0].perf_metrics, tab);
                    if($scope.hidePerformanceReportTab) {
                        errorHandlerForPerformanceTab();
                    } else {
                        $scope.screenBusy = false;
                        $scope.formatBusy = false;
                        $scope.dowBusy = false;
                        $scope['strategyPerfDataBy'+tab]  = result.data.data[0];
                    }
                } else {
                    errorHandlerForPerformanceTab(result);
                }
            }, errorHandlerForPerformanceTab);
        };

        $scope.$on(constants.EVENT_CAMPAIGN_CHANGED , function(event,campaign){
            $scope.init();
            $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign();  //update the selected Campaign
            $scope.createDownloadReportUrl();
        });

        $scope.$on(constants.EVENT_STRATEGY_CHANGED , function(event,strategy){
            $scope.selectedStrategy.id =  strategySelectModel.getSelectedStrategy().id ;
            $scope.selectedStrategy.name = strategySelectModel.getSelectedStrategy().name ;
            $scope.strategyHeading = Number($scope.selectedStrategy.id) === 0 ? 'Campaign total' : 'Strategy total';
            $scope.isStrategyDataEmpty = false;
            $scope.resetVariables();
            $scope.strategyChangeHandler();
        });

        //creating download report url
        $scope.createDownloadReportUrl = function () {
            var urlPath = apiPaths.apiSerivicesUrl + '/campaigns/' + $scope.selectedCampaign.id + '/performance/';
            $scope.download_report = [
                {
                    'report_url': urlPath + 'screensandformats/reportDownload?date_filter=' + $scope.selected_filters.time_filter,
                    'report_name' : 'by_screens_and_formats',
                    'label' : 'Performance by Screens & Formats'
                },
                {
                    'report_url' : urlPath + 'daysofweek/reportDownload?date_filter=' + $scope.selected_filters.time_filter,
                    'report_name' : 'by_days_of_week',
                    'label' : 'Performance by Days Of Week'
                }
            ];
        };

        //Function is called from startegylist directive
        $scope.strategyChangeHandler = function () {
            $scope.reportDownloadBusy = false;
            if($scope.selectedStrategy.id == -99 ||$scope.selectedStrategy.id == -1  ){
                $scope.strategyFound = false ;
            } else {
                $scope.strategyFound = true;
                $scope.getPerformanceData();
                analytics.track(loginModel.getUserRole(), constants.GA_USER_STRATEGY_SELECTION, $scope.selectedStrategy.name, loginModel.getLoginName());
            }
        };

        //Binding click event on tab and fetch strategy method.
        $(function() {
            $(".each_tab").click(function (event) {
                var tab_id = $(this).attr("id").split("_tab")
                $scope.selected_tab = tab_id[0];
                $(".reports_tabs_holder").find(".active").removeClass("active");
                $(this).addClass("active");
                $(".reports_block").hide();
                $("#reports_" + tab_id[0] + "_block").show();
                $scope.strategyChangeHandler();
                event.preventDefault();
            });
        });

        //resetting the variable
        $scope.resetVariables =  function() {
            $scope.screenBusy = false;
            $scope.formatBusy = false;
            $scope.dowBusy = false;

            $scope.strategyPerfDataByScreen = [];
            $scope.strategyPerfDataByFormat = [];
            $scope.strategyPerfDataByDOW = [];

            $scope.dataNotFoundForScreen = false;
            $scope.dataNotFoundForFormat = false;
            $scope.dataNotFoundForDOW = false;
        };

        //Initializing the variable.
        $scope.init= function(){
            $scope.strategyFound = false ;
            $scope.api_return_code = 200;
            $scope.isStrategyDataEmpty = false;
            $scope.hidePerformanceReportTab = false;
            $scope.strategies = {};
            $scope.resetVariables();
            $scope.selected_filters = {};
            $scope.selected_filters.time_filter = 'life_time'; //
            $scope.selected_filters.campaign_default_kpi_type =  kpiSelectModel.getSelectedKpi();
            $scope.selected_filters.kpi_type = kpiSelectModel.getSelectedKpi();
        };


        $scope.init();

        $scope.$on(constants.EVENT_TIMEPERIOD_CHANGED, function(event) {
            $scope.callBackKpiDurationChange('duration');
        });


        $scope.$on(constants.EVENT_KPI_CHANGED, function(e) {
            if($scope.selected_filters == undefined)
                $scope.selected_filters = {} ;
            $scope.selected_filters.kpi_type = kpiSelectModel.getSelectedKpi();
        });
    });
}());
