var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('viewabilityController', function ($scope, $window, viewablityService, campaignSelectModel,kpiSelectModel, strategySelectModel, utils, domainReports, apiPaths, constants, timePeriodModel, loginModel, analytics) {

        //Hot fix to show the campaign tab selected
        $(".main_navigation").find('.active').removeClass('active').end().find('#reports_nav_link').addClass('active');


        $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign() ;
        $scope.selectedStrategy = strategySelectModel.getSelectedStrategy();
        $scope.viewabilityBusy = true ;

     //   $scope.selected_filters = domainReports.getDurationKpi();
        $scope.filters = domainReports.getReportsDropDowns();

        $scope.download_urls = {
            tactics: null,
            domains: null,
            publishers: null,
            exchanges: null
        };

        $scope.init = function (){

            $scope.viewData = {};
            $scope.viewabilityBusy = true ;
            $scope.strategyBusy = false;
            $scope.tacticBusy = false ;
            $scope.strategyFound = false;

            $scope.selected_filters = {};
            $scope.selected_filters.time_filter = 'life_time'; //
            $scope.selected_filters.campaign_default_kpi_type = $scope.selectedCampaign.kpi.toLowerCase() ;
            $scope.selected_filters.kpi_type = kpiSelectModel.getSelectedKpi();

        };

        $scope.init();

        $scope.tacticViewData = function (param, strategiesList) {
            $scope.tacticBusy = true;
            viewablityService.getTacticsViewData(param).then(function (result) {
                if (result.status === "OK" || result.status === "success") {

                    $scope.tacticBusy = false;
                    strategiesList.tacticsList = result.data.data[0].tactics;
                    $scope.viewData = strategiesList;

                } // Means no strategy data found
                else {
                    $scope.tacticBusy =false;
                }
            });
        };


        //Function called to show Strategy list
        $scope.strategyViewData = function (param) {
            var strategiesList = {};
            $scope.strategyBusy = true;
            $scope.tacticBusy = true;
            viewablityService.getStrategyViewData(param).then(function (result) {
                if (result.status === "OK" || result.status === "success") {
                   // console.log("in view metric page");
                   // console.log(result.data.data);
                    strategiesList = result.data.data;
                    $scope.strategyBusy = false;
                    if (strategiesList) {
                        $scope.dataNotFound = false;
                        $scope.tacticViewData(param, strategiesList);

                    } else {
                        $scope.dataNotFound = true;
                        $scope.strategyBusy = false;
                        $scope.tacticBusy = false ;

                    }

                } // Means no strategy data found
                else {
                    $scope.dataNotFound = true;
                    $scope.strategyBusy = false;
                    $scope.tacticBusy = false;
                }
            });
        };

        $scope.$on(constants.EVENT_KPI_CHANGED, function(e) {

            $scope.selected_filters.kpi_type = kpiSelectModel.getSelectedKpi();
            $scope.$apply();
        });


        //This will be called from directive_controller.js
        $scope.callBackCampaignsSuccess = function () {
            var urlPath = apiPaths.apiSerivicesUrl + '/campaigns/' + $scope.selectedCampaign.id + '/viewability/';
            $scope.download_urls = {
                tactics: urlPath + 'tactics/download?date_filter=' + $scope.selected_filters.time_filter,
                domains: urlPath + 'domains/download?date_filter=' + $scope.selected_filters.time_filter,
                publishers: urlPath + 'publishers/download?date_filter=' + $scope.selected_filters.time_filter,
                exchanges: urlPath + 'exchanges/download?date_filter=' + $scope.selected_filters.time_filter
            };
        };

        $scope.$on(constants.EVENT_CAMPAIGN_CHANGED , function(event,campaign){
            $scope.viewabilityBusy = true ;
            $scope.init();

            //update the selected Campaign
            $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign() ;
            $scope.callBackCampaignsSuccess();

        });

        $scope.$on(constants.EVENT_STRATEGY_CHANGED , function(event,strategy){
            $scope.viewabilityBusy = true ;
            $scope.selectedStrategy.id =  strategySelectModel.getSelectedStrategy().id ;
            $scope.selectedStrategy.name = strategySelectModel.getSelectedStrategy().name ;
            $scope.callBackStrategyChange();
        });


        //Function is called from startegylist directive
        $scope.callBackStrategyChange = function () {
            $scope.viewData = {};

            if($scope.selectedStrategy.id == -99 ||$scope.selectedStrategy.id == -1  ){
                $scope.strategyFound = false ;

            } else {
                $scope.strategyFound = true ;
                $scope.strategyViewData({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, time_filter: $scope.selected_filters.time_filter });
                analytics.track(loginModel.getUserRole(), constants.GA_USER_STRATEGY_SELECTION, $scope.selectedStrategy.name, loginModel.getLoginName());
            }
            //Call the chart to load with the changed campaign id and strategyid
           $scope.viewabilityBusy = false ;
        };

        $scope.$on(constants.EVENT_TIMEPERIOD_CHANGED, function(event) {
          $scope.callBackKpiDurationChange('duration');
        });


        $scope.downloadViewabilityReport = function(report_url, report_name) {
            if (loginModel.hasCookieExpired()) {
                loginModel.checkCookieExpiry();
            } else {
                $window.location.href = report_url;
                analytics.track(loginModel.getUserRole(), constants.GA_DOWNLOAD_REPORT, 'viewability_' + report_name + '_report', loginModel.getLoginName());
            }
        }

    });


}());