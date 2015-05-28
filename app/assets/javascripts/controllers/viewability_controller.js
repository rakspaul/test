var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('viewabilityController', function ($scope, $window, viewablityService, campaignSelectModel,kpiSelectModel, strategySelectModel, utils, dataService, domainReports, apiPaths, constants, timePeriodModel, loginModel, analytics) {

        //highlight the header menu - Dashborad, Campaigns, Reports
        domainReports.highlightHeaderMenu();

        $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign() ;
        $scope.selectedStrategy = strategySelectModel.getSelectedStrategy();
        $scope.strategyLoading =  true;
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
            else if (dataSetType == 'viewability')
                return constants.MSG_METRICS_NOT_TRACKED;
            else
                return constants.MSG_DATA_NOT_AVAILABLE;
        };
     //   $scope.selected_filters = domainReports.getDurationKpi();
        $scope.filters = domainReports.getReportsTabs();

        $scope.download_urls = {
            tactics: null,
            domains: null,
            publishers: null,
            exchanges: null
        };

        $scope.init = function (){

            $scope.viewData = {};
            $scope.strategyBusy = false;
            $scope.tacticBusy = false ;
            $scope.strategyFound = false;
            $scope.isStrategyDropDownShow = true;

            $scope.selected_filters = {};
            $scope.selected_filters.time_filter = 'life_time'; //
            $scope.selected_filters.campaign_default_kpi_type = $scope.selectedCampaign.kpi.toLowerCase() ;
            $scope.selected_filters.kpi_type = kpiSelectModel.getSelectedKpi();

        };

        $scope.init();

        $scope.tacticViewData = function (param, strategiesList) {
            $scope.tacticBusy = true;
            var errorHandler = function() {
                $scope.tacticBusy =false;
            }
            viewablityService.getTacticsViewData(param).then(function (result) {
                if (result.status === "OK" || result.status === "success") {

                    $scope.tacticBusy = false;
                    strategiesList.tacticsList = result.data.data[0].tactics;
                    $scope.viewData = strategiesList;

                } // Means no strategy data found
                else {
                    errorHandler();
                }
            }, errorHandler);
        };


        //Function called to show Strategy list
        $scope.strategyViewData = function (param) {
            var strategiesList = {};
            $scope.strategyBusy = true;
            $scope.tacticBusy = false;
            var errorHandler = function() {
                $scope.dataNotFound = true;
                $scope.strategyBusy = false;
                $scope.tacticBusy = false;
            }
            $scope.api_return_code = 200;
            viewablityService.getStrategyViewData(param).then(function (result) {
                if (result.status === "OK" || result.status === "success") {
                   // console.log("in view metric page");
                   // console.log(result.data.data);
                    strategiesList = result.data.data;
                    $scope.viewData = strategiesList;
                    $scope.strategyBusy = false;
                    if (strategiesList) {
                        $scope.dataNotFound = false;
                        if(param.strategyId) {
                            $scope.tacticBusy = true;
                            $scope.tacticViewData(param, strategiesList);
                        }$scope.strategyHeading = Number($scope.selectedStrategy.id) === 0 ? 'Campaign total' : 'Strategy total';

                    } else {
                        errorHandler();
                    }
                } // Means no strategy data found
                else {

                    if (result.status ==='error')
                        $scope.api_return_code= result.data.status;
                    errorHandler();
                }
            }, errorHandler);
        };

        $scope.$on(constants.EVENT_KPI_CHANGED, function(e) {
            $scope.selected_filters.kpi_type = kpiSelectModel.getSelectedKpi();
        });

        //creating download report url
        $scope.createDownloadReportUrl = function () {
            var urlPath = apiPaths.apiSerivicesUrl + '/campaigns/' + $scope.selectedCampaign.id + '/viewability/';
            $scope.download_report = [
                {
                    'report_url': urlPath + 'tactics/download?date_filter=' + $scope.selected_filters.time_filter,
                    'report_name' : 'by_tactic',
                    'label' : 'Viewability by Tactic'
                },
                {
                    'report_url' : urlPath + 'domains/download?date_filter=' + $scope.selected_filters.time_filter,
                    'report_name' : 'by_domain',
                    'label' : 'Viewability by Domain'
                },
                {
                    'report_url' : urlPath + 'publishers/download?date_filter=' + $scope.selected_filters.time_filter,
                    'report_name' : 'by_publisher',
                    'label' : 'Viewability by Publisher'
                },
                {
                    'report_url' : urlPath + 'exchanges/download?date_filter=' + $scope.selected_filters.time_filter,
                    'report_name' : 'by_exchange',
                    'label' : 'Viewability by Exchange'
                }
            ];
        };

        $scope.$on(constants.EVENT_CAMPAIGN_CHANGED , function(event,campaign){
            $scope.init();
            //update the selected Campaign
            $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign() ;
            $scope.createDownloadReportUrl();

        });

        $scope.$on(constants.EVENT_STRATEGY_CHANGED , function(event,strategy){
            $scope.selectedStrategy.id =  strategySelectModel.getSelectedStrategy().id ;
            $scope.selectedStrategy.name = strategySelectModel.getSelectedStrategy().name ;
            $scope.strategyHeading = Number($scope.selectedStrategy.id) === 0 ? 'Compaign total' : 'Strategy total';
            $scope.callBackStrategyChange();
        });

        //Function is called from startegylist directive
        $scope.callBackStrategyChange = function () {
            $scope.viewData = {};
            if($scope.selectedStrategy.id == -99 ||$scope.selectedStrategy.id == -1  ){
                $scope.strategyFound = false ;
            } else {
                $scope.strategyFound = true;
                $scope.strategyViewData({
                    campaign_id: $scope.selectedCampaign.id,
                    strategyId: Number($scope.selectedStrategy.id),
                    kpi_type: $scope.selected_filters.kpi_type,
                    time_filter: $scope.selected_filters.time_filter
                });
                analytics.track(loginModel.getUserRole(), constants.GA_USER_STRATEGY_SELECTION, $scope.selectedStrategy.name, loginModel.getLoginName());
            }
                //Call the chart to load with the changed campaign id and strategyid
            $scope.viewabilityBusy = false ;
        };

        $scope.$on(constants.EVENT_TIMEPERIOD_CHANGED, function(event) {
          $scope.callBackKpiDurationChange('duration');
        });
    });


}());