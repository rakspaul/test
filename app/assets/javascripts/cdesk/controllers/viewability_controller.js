var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('viewabilityController', function ($scope, inventoryService, utils, dataTransferService, domainReports) {


        $scope.selectedCampaign = {
            id: '-1',
            name: 'Loading...'
        };

        $scope.selectedStrategy = {
            id: '-1',
            name: 'Loading...'
        };

        $scope.selected_filters = domainReports.getDurationKpi();

        $scope.filters = domainReports.getReportsDropDowns();

        $scope.strategiesList={
            tacticsList:[]
        };
        $scope.getStrategyTacticsChart= function (param, strategiesList) {
            inventoryService.getViewablityStrategiesTactics(param).then(function (result) {
                if (result.status === "OK" || result.status === "success") {

                    strategiesList.tacticsList = result.data.data[0].tactics;
                    $scope.strategiesList =strategiesList;
                } // Means no strategy data found
                else {
                }
            });
        };


        //Function called to show Strategy list
        $scope.getStrategyList = function (param) {
            inventoryService.getViewablityStrategies(param).then(function (result) {
                if (result.status === "OK" || result.status === "success") {

                   var strategiesList = result.data.data;
                    $scope.getStrategyTacticsChart(param, strategiesList);

                } // Means no strategy data found
                else {
                }
            });
        };



        $scope.checkStatus = function () {
            // $scope.tacticList[$scope.tacticList.show][0].chart= true;
            if ($scope.selectedCampaign.name == 'Loading...' ||
                $scope.selectedStrategy.name == 'Loading...' ||
                $scope.selectedCampaign.name == 'No Campaign Found' ||
                $scope.selectedStrategy.name == 'No Strategy Found') {
                return false;
            }
            return true;
        };




        //This function is called from the directive, onchange of the dropdown
        $scope.onKpiDurationChange = function(kpiType) {
            if (kpiType == 'duration') {
                $scope.getStrategyList({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, time_filter: $scope.selected_filters.time_filter });
                dataTransferService.updateExistingStorageObjects({'filterDurationType' : $scope.selected_filters.time_filter, 'filterDurationValue' : $scope.selected_filters.time_filter_text});
            }else{
                $scope.$apply();
                dataTransferService.updateExistingStorageObjects({'filterKpiType' : $scope.selected_filters.kpi_type, 'filterKpiValue' : $scope.selected_filters.kpi_type_text});
            }
        };

        ///////////////////////////////////////////////////////////////////////////////////////////////////////
        //Campaign Strategy List
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        $scope.setCampaignStrategyList = function(campaigns){
            $scope.campaingns = campaigns;
            if (typeof  $scope.campaingns !== 'undefined' && $scope.campaingns.length > 0) {
                //Maintain the selected campaign name and id;
                $scope.selectedCampaign.id =  dataTransferService.getDomainReportsValue('campaignId') ? dataTransferService.getDomainReportsValue('campaignId') : $scope.campaingns[0].campaign_id;
                $scope.selectedCampaign.name = dataTransferService.getDomainReportsValue('campaignName') ? dataTransferService.getDomainReportsValue('campaignName') :  $scope.campaingns[0].name;
            }
            else {
                if (typeof  $scope.campaingns !== 'undefined' && $scope.campaingns.length > 0) {
                    $scope.selectedCampaign.id = -1;
                    $scope.selectedCampaign.name = "No Campaign Found";
                }
            }

            if ($scope.selectedCampaign.id !== -1) {
                $scope.strategylist($scope.selectedCampaign.id);
            }
        };

        $scope.campaignlist = function () {
            if(dataTransferService.getCampaignList() === false){
                domainReports.getCampaignListForUser().then(function (result) {
                    var campaigns = result.data.data.slice(0, 1000);
                    dataTransferService.setCampaignList('campaignList', campaigns);
                    $scope.setCampaignStrategyList(campaigns);
                });
            }else{
                $scope.setCampaignStrategyList(domainReports.getCampaignListForUser());
            }
        };

        $scope.strategylist = function (campaignId) {
            $scope.selectedStrategy.name = "Loading...";
            inventoryService.getStrategiesForCampaign(campaignId).then(function (result) {
                $scope.strategies = result.data.data;
                if ($scope.strategies !== 'undefined' && $scope.strategies.length > 0) {
                    if(dataTransferService.getDomainReportsValue('previousCampaignId') !== dataTransferService.getDomainReportsValue('campaignId')) {
                        $scope.selectedStrategy.id = $scope.strategies[0].id;
                        $scope.selectedStrategy.name = $scope.strategies[0].name;
                    }else {
                        $scope.selectedStrategy.id =  dataTransferService.getDomainReportsValue('strategyId') ? dataTransferService.getDomainReportsValue('strategyId') : $scope.strategies[0].id;
                        $scope.selectedStrategy.name = dataTransferService.getDomainReportsValue('strategyName') ? dataTransferService.getDomainReportsValue('strategyName') :  $scope.strategies[0].name;
                    }

                    //Call the chart to load with the changed campaign id and strategyid
                     $scope.getStrategyList({campaign_id: campaignId, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, time_filter: $scope.selected_filters.time_filter });
                }
                else { //  means empty strategy list
                    $scope.selectedStrategy.id = -1;
                    $scope.selectedStrategy.name = "No Strategy Found";
                }
            });
        };

        $scope.campaignlist();

        //Function called when the user clicks on the campaign dropdown
        $('#campaigns_list').click(function (e) {
            var id = $(e.target).attr('value'), txt = $(e.target).text();
            $scope.selectedCampaign.id = id;
            $scope.selectedCampaign.name = txt;
            dataTransferService.updateExistingStorageObjects({'campaignId' : id, 'campaignName' :  txt, 'previousCampaignId' : dataTransferService.getDomainReportsValue('campaignId')});
            $scope.$apply();
            if($scope.selectedCampaign.id !== -1) {
                $scope.strategylist($scope.selectedCampaign.id);
            }else{
                $scope.selectedStrategy.id= -1;
                $scope.selectedStrategy.name = "No Strategy Found";
            }

        });


        $scope.checkStatus = function () {
            $scope.inventoryChart = true;
            // $scope.tacticList[$scope.tacticList.show][0].chart= true;
            if ($scope.selectedCampaign.name == 'Loading...' ||
                $scope.selectedStrategy.name == 'Loading...' ||
                $scope.selectedCampaign.name == 'No Campaign Found' ||
                $scope.selectedStrategy.name == 'No Strategy Found') {
                return false;
            }
            return true;
        };

        //Function called when the user clicks on the strategy dropdown
        $('#strategies_list').click(function (e) {

            if ($scope.checkStatus()) {
                var id = $(e.target).attr('value'), txt = $(e.target).text();
                $scope.selectedStrategy.id =id;
                $scope.selectedStrategy.name = txt;
                dataTransferService.updateExistingStorageObjects({'strategyId' : id, 'strategyName' :  txt});
                $scope.$apply();
            }
        });

        //Hot fix to show the campaign tab selected
        $("ul.nav:first").find('.active').removeClass('active').end().find('li:contains(Reports)').addClass('active');
    });
}());