var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('costController', function ($scope, viewablityService, utils, dataTransferService, domainReports, apiPaths) {


        $scope.selectedCampaign = domainReports.getDefaultValues();

        $scope.selectedStrategy = domainReports.getDefaultValues();

        $scope.selected_filters = domainReports.getDurationKpi();

        $scope.filters = domainReports.getReportsDropDowns();

        $scope.strategiesList={
            tacticsList:[]
        };

        $scope.callBackCampaignsSuccess= function(){
            //TODO, logic needs to be done
        };

        $scope.callBackCampaignsFailure= function(){
            //TODO, logic needs to be done
        };

        $scope.updateStrategyObjects = function(strategy){
            $scope.strategies = strategy;
            //console.log($scope.strategies);
            if ($scope.strategies !== 'undefined' && $scope.strategies.length > 0) {
                //If a different campaign is selected, then load the first strategy data
                var strategyObj = domainReports.loadFirstStrategy($scope.strategies[0].id, $scope.strategies[0].name);
                $scope.selectedStrategy.id =  strategyObj.id;
                $scope.selectedStrategy.name =  strategyObj.name;
                $scope.strategyFound=true;
                //Call the chart to load with the changed campaign id and strategyid
                $scope.chartForStrategy=true;

            } else { //  means empty strategy list
                $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
                $scope.chartForStrategy=false;
                $scope.tacticNotFound=true;

            }
        };

        $scope.strategylist = function (campaignId) {
            $scope.selectedStrategy.name = "Loading...";
            if(dataTransferService.getCampaignStrategyList(campaignId) === false){
                domainReports.getCampaignStrategyList(campaignId).then(function (result) {
                    var strategy = result.data.data;
                    dataTransferService.setCampaignStrategyList(campaignId , strategy);
                    $scope.updateStrategyObjects(strategy);
                });
            }else{
                $scope.updateStrategyObjects(domainReports.getCampaignStrategyList(campaignId));
            }
        };


        $scope.callBackCampaignChange = function(){
            //TODO logic of onchnage campaign
            $scope.strategylist($scope.selectedCampaign.id);
        };

        //Function is called from startegylist directive
        $scope.callBackStrategyChange = function() {
            //TODO logic of onchnage campaign
            //Call the chart to load with the changed campaign id and strategyid
            //$scope.getStrategyList({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, time_filter: $scope.selected_filters.time_filter });
        };


        //Hot fix to show the campaign tab selected
        $("ul.nav:first").find('.active').removeClass('active').end().find('li:contains(Reports)').addClass('active');
    });
}());