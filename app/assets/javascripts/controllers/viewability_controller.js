var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('viewabilityController', function ($scope, $window, viewablityService, utils, dataTransferService, domainReports, apiPaths, constants, timePeriodModel, loginModel, analytics) {

        //Hot fix to show the campaign tab selected
        $(".main_navigation").find('.active').removeClass('active').end().find('#reports_nav_link').addClass('active');


        $scope.selectedCampaign = domainReports.intValues()['campaign'];
        $scope.selectedStrategy = domainReports.intValues()['strategy'];

        $scope.selected_filters = domainReports.getDurationKpi();
        $scope.filters = domainReports.getReportsDropDowns();

        $scope.download_urls = {
            tactics: null,
            domains: null,
            publishers: null,
            exchanges: null
        };

        $scope.init = function (){

            $scope.strategies = {} ;
            $scope.viewData = {};
            $scope.strategyBusy = false;
            $scope.tacticBusy = false ;
            $scope.strategyFound = false;

        }

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

        //This function is called from the directive, onchange of the dropdown
        $scope.callBackKpiDurationChange = function (kpiType) {
            if (kpiType == 'duration') {
                $scope.strategyViewData({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, time_filter: $scope.selected_filters.time_filter });
                dataTransferService.updateExistingStorageObjects({'filterDurationType': $scope.selected_filters.time_filter, 'filterDurationValue': $scope.selected_filters.time_filter_text});
                var urlPath = apiPaths.apiSerivicesUrl + '/campaigns/' + $scope.selectedCampaign.id + '/viewability/';
                $scope.download_urls = {
                    tactics: urlPath + 'tactics/download?date_filter=' + $scope.selected_filters.time_filter,
                    domains: urlPath + 'domains/download?date_filter=' + $scope.selected_filters.time_filter,
                    publishers: urlPath + 'publishers/download?date_filter=' + $scope.selected_filters.time_filter,
                    exchanges: urlPath + 'exchanges/download?date_filter=' + $scope.selected_filters.time_filter
                };
            } else {
                $scope.$apply();
                dataTransferService.updateExistingStorageObjects({'filterKpiType': $scope.selected_filters.kpi_type, 'filterKpiValue': $scope.selected_filters.kpi_type_text});
                analytics.track(loginModel.getUserRole(), constants.GA_VIEWABILITY_TAB_METRIC_SELECTED, $scope.selected_filters.kpi_type_text, loginModel.getLoginName());
            }
        };


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

        //Called from directive_controller.js,  this is required, do not remove;
        $scope.callBackCampaignsFailure = function () {
          $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
          $scope.strategyFound = false ;
          $scope.strategies = {} ; // if No Strategy then clear the strategy list.
        };

        //Called from directive_controller.js,  when the user selects the campaign dropdown option
        $scope.callBackCampaignChange = function () {
            $scope.init();
            $scope.selectedStrategy = domainReports.getDefaultValues()['strategy'];
            if ($scope.selectedCampaign.id !== -1) {
                $scope.callBackCampaignsSuccess();
                $scope.strategylist($scope.selectedCampaign.id);
            } else {
                $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
                $scope.strategies = {} ; // if No Strategy then clear the strategy list.
            }
           // $scope.$apply();
        };

        $scope.updateStrategyObjects = function (strategy) {
            $scope.strategies = strategy;
            if ($scope.strategies !== 'undefined' && $scope.strategies.length > 0) {
                //If a different campaign is selected, then load the first strategy data
                var strategyObj = domainReports.loadFirstStrategy($scope.strategies[0].id, $scope.strategies[0].name);
                $scope.selectedStrategy.id = strategyObj.id;
                $scope.selectedStrategy.name = strategyObj.name;
                if ($scope.selectedStrategy.id == -1) {
                    $scope.strategyFound = false;
                  //  $scope.dataNotFound = true;
                }else {
                    //Call the chart to load with the changed campaign id and strategyid
                    $scope.strategyFound = true;
                    $scope.strategyViewData({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, time_filter: $scope.selected_filters.time_filter });

                }
            } else { //  means empty strategy list
              //  $scope.dataNotFound = true;
                $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
                $scope.strategyFound = false;
                $scope.strategies = {} ; // if No Strategy then clear the strategy list.
            }
        };


        //Calling the Strategy object based on the campaignId
        $scope.strategylist = function (campaignId) {
            $scope.selectedStrategy.name = "Loading...";
                domainReports.getCampaignStrategyList(campaignId).then(function (result) {
                    if (result.status == 'success') {
                        var strategy = result.data.data;
                        $scope.updateStrategyObjects(strategy);
                    } else {
                        $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
                    }
                });
        };

        //Function is called from startegylist directive
        $scope.callBackStrategyChange = function () {
            $scope.viewData = {};
            //Call the chart to load with the changed campaign id and strategyid
            $scope.strategyViewData({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, time_filter: $scope.selected_filters.time_filter });
            analytics.track(loginModel.getUserRole(), constants.GA_USER_STRATEGY_SELECTION, $scope.selectedStrategy.name, loginModel.getLoginName());
        };

        $scope.$on(constants.EVENT_TIMEPERIOD_CHANGED, function(event) {
          $scope.callBackKpiDurationChange('duration');
        });

        $scope.$on(constants.NAVIGATION_FROM_CAMPAIGNS, function() {

            console.log("navigation from campaing handled in listening function: viewability");

            if ($scope.selectedCampaign.id !== -1) {
                $scope.strategylist($scope.selectedCampaign.id);
                $scope.callBackCampaignsSuccess();
            } else {
                $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
                $scope.strategyFound = false ;
                $scope.strategies = {} ; // if No Strategy then clear the strategy list.

            }

        });

        $scope.downloadViewabilityReport = function(report_url, report_name) {
            $window.location.href = report_url;
            analytics.track(loginModel.getUserRole(), constants.GA_DOWNLOAD_REPORT, 'viewability_' + report_name + '_report', loginModel.getLoginName());
        }

    });


}());