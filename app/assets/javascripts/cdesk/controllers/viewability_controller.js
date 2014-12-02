var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('viewabilityController', function ($scope, viewablityService, utils, dataTransferService, domainReports, apiPaths) {

        //Hot fix to show the campaign tab selected
        $("ul.nav:first").find('.active').removeClass('active').end().find('li:contains(Reports)').addClass('active');

        $scope.selectedCampaign = domainReports.getDefaultValues();

        $scope.selectedStrategy = domainReports.getDefaultValues();

        $scope.selected_filters = domainReports.getDurationKpi();

        $scope.filters = domainReports.getReportsDropDowns();


        $scope.download_urls = {
            tactics: null,
            domains: null,
            publishers: null,
            exchanges: null
        };
        var urlPath = apiPaths.apiSerivicesUrl + '/campaigns/' + $scope.selectedCampaign.id + '/viewability/';


        $scope.tacticViewData = function (param, strategiesList) {
            viewablityService.getTacticsViewData(param).then(function (result) {
                if (result.status === "OK" || result.status === "success") {

                    strategiesList.tacticsList = result.data.data[0].tactics;
                    $scope.strategiesList = strategiesList;
                } // Means no strategy data found
                else {
                }
            });
        };


        //Function called to show Strategy list
        $scope.strategyViewData = function (param) {
            var strategiesList = {};
            $scope.dataNotFound = true;
            viewablityService.getStrategyViewData(param).then(function (result) {
                if (result.status === "OK" || result.status === "success") {
                    console.log("in view metric page");
                    console.log(result.data.data);
                    strategiesList = result.data.data;
                    if (strategiesList) {
                        $scope.dataNotFound = false;
                        $scope.tacticViewData(param, strategiesList);

                    } else {
                        $scope.dataNotFound = true;
                    }

                } // Means no strategy data found
                else {
                    $scope.dataNotFound = true;
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
            console.log('This function is required');
        };

        //Called from directive_controller.js,  when the user selects the campaign dropdown option
        $scope.callBackCampaignChange = function () {
            if ($scope.selectedCampaign.id !== -1) {
                $scope.callBackCampaignsSuccess();
                $scope.strategylist($scope.selectedCampaign.id);
            } else {
                $scope.$parent.selectedStrategy = domainReports.getNotFound()['strategy'];
            }
        };

        $scope.updateStrategyObjects = function (strategy) {
            $scope.strategies = strategy;
            if ($scope.strategies !== 'undefined' && $scope.strategies.length > 0) {
                //If a different campaign is selected, then load the first strategy data
                var strategyObj = domainReports.loadFirstStrategy($scope.strategies[0].id, $scope.strategies[0].name);
                $scope.selectedStrategy.id = strategyObj.id;
                $scope.selectedStrategy.name = strategyObj.name;
                $scope.strategyFound = true;
                $scope.dataNotFound = false;
                //Call the chart to load with the changed campaign id and strategyid
                $scope.strategyViewData({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, time_filter: $scope.selected_filters.time_filter });
            } else { //  means empty strategy list
                $scope.dataNotFound = true;
                $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
            }
        };


        //Calling the Strategy object based on the campaignId
        $scope.strategylist = function (campaignId) {
            $scope.selectedStrategy.name = "Loading...";
            if (dataTransferService.getCampaignStrategyList(campaignId) === false) {
                domainReports.getCampaignStrategyList(campaignId).then(function (result) {
                    if (result.status == 'success') {
                        var strategy = result.data.data;
                        dataTransferService.setCampaignStrategyList(campaignId, strategy);
                        $scope.updateStrategyObjects(strategy);
                    } else {
                        $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
                    }
                });
            } else {
                $scope.updateStrategyObjects(domainReports.getCampaignStrategyList(campaignId));
            }
        };

        //Function is called from startegylist directive
        $scope.callBackStrategyChange = function () {
            //Call the chart to load with the changed campaign id and strategyid
            $scope.strategyViewData({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, time_filter: $scope.selected_filters.time_filter });
        };


    });


}());