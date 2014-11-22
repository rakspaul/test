var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('costController', function ($scope, $location, $anchorScroll, dataService, utils, $http,dataTransferService,actionChart, $timeout, inventoryService, domainReports, apiPaths, actionColors, campaign) {

        $scope.filters = domainReports.getReportsDropDowns();

        $scope.selectedCampaign = domainReports.getDefaultValues();

        $scope.selectedStrategy = domainReports.getDefaultValues();



        //Function called, when on load
        $scope.init = function(){
            $scope.campaignlist();
        };

       ///////////////////////////////////////////////////////////////////////////////////////////////////////
        //Campaign Strategy List
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        $scope.setCampaignStrategyList = function(campaigns){
            $scope.campaingns = campaigns;
            if (typeof  $scope.campaingns !== 'undefined' && $scope.campaingns.length > 0) {
                //Maintain the selected campaign name and id;
                $scope.selectedCampaign = domainReports.getFound($scope.campaingns[0])['campaign'];
                //Set the KPI Type here
                //$scope.campaignKpiType = dataTransferService.getDomainReportsValue('filterKpiType') ? dataTransferService.getDomainReportsValue('filterKpiType') : $scope.campaingns[0].kpi_type;
                dataTransferService.updateExistingStorageObjects({
                    filterKpiType:dataTransferService.getDomainReportsValue('filterKpiType') ? dataTransferService.getDomainReportsValue('filterKpiType') : $scope.campaingns[0].kpi_type,
                    filterKpiValue : dataTransferService.getDomainReportsValue('filterKpiValue') ? dataTransferService.getDomainReportsValue('filterKpiValue') : ($scope.campaingns[0].kpi_type === 'action_rate') ? 'Action Rate' : $scope.campaingns[0].kpi_type
                });

            }  else {
                if (typeof  $scope.campaingns !== 'undefined' && $scope.campaingns.length > 0) {
                    $scope.selectedCampaign = domainReports.getNotFound()['campaign'];
                }
            }
            if ($scope.selectedCampaign.id !== -1) {
                $scope.strategylist($scope.selectedCampaign.id);
            }
        };

        $scope.campaignlist = function () {
            if(dataTransferService.getCampaignList() === false){
                domainReports.getCampaignListForUser().then(function (result) {
                    if(result.status == 'success') {
                        var campaigns = result.data.data;//.slice(0, 1000);
                        dataTransferService.setCampaignList('campaignList', campaigns);
                        $scope.setCampaignStrategyList(campaigns);
                    }
                });
            }else{
                $scope.setCampaignStrategyList(domainReports.getCampaignListForUser());
            }
        };


        $scope.updateStrategyObjects = function(strategy){

            $scope.strategies = strategy;
            if ($scope.strategies !== 'undefined' && $scope.strategies.length > 0) {
                //If a different campaign is selected, then load the first strategy data
                var strategyObj = domainReports.loadFirstStrategy($scope.strategies[0].id, $scope.strategies[0].name);
                $scope.selectedStrategy.id = strategyObj.id;
                $scope.selectedStrategy.name = strategyObj.name;
                $scope.strategyFound=true;
                //Call the chart to load with the changed campaign id and strategyid
                //$scope.chartForStrategy=true;
               // $scope.loadCdbDataForStrategy()
            } else { //  means empty strategy list
                $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
                //$scope.chartForStrategy=false;
                //$scope.tacticNotFound=true;
                //console.log('1');
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

        //Function called when the user clicks on the campaign dropdown
        $('#campaigns_list').click(function (e) {
            var id = $(e.target).attr('value'), txt = $(e.target).text();
            $scope.selectedCampaign.id = id;
            $scope.selectedCampaign.name = txt;
            //$scope.campaign.kpi_type =  $(e.target).attr('_kpi');
            dataTransferService.updateExistingStorageObjects({
                'campaignId' : id,
                'campaignName' :  txt,
                'previousCampaignId' : dataTransferService.getDomainReportsValue('campaignId'),
                'filterKpiValue': ($(e.target).attr('_kpi') === 'action_rate') ? 'Action Rate' : $(e.target).attr('_kpi'),
                'filterKpiType': $(e.target).attr('_kpi')
            });
            $scope.$apply();

            if($scope.selectedCampaign.id !== -1) {
               // $scope.chartForStrategy=true;
                $scope.strategylist($scope.selectedCampaign.id);
                //$scope.getActionItemsByCampaign();
            }
            else{
              //  $scope.chartForStrategy=false;
                //console.log('4');
                $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
            }
        });



        //Function called when the user clicks on the strategy dropdown
       /* $('#strategies_list').click(function (e) {
            if (domainReports.checkStatus($scope.selectedCampaign.name, $scope.selectedStrategy.name)) {
                var id = $(e.target).attr('value'), txt = $(e.target).text();
                $scope.selectedStrategy.id =id;
                $scope.selectedStrategy.name = txt;
                dataTransferService.updateExistingStorageObjects({'strategyId' : id, 'strategyName' :  txt});
                $scope.$apply();
               *//* $scope.chartForStrategy=true;
                $scope.loadCdbDataForStrategy();*//*
            }
        });*/

        //Hot fix to show the campaign tab selected
        $("ul.nav:first").find('.active').removeClass('active').end().find('li:contains(Reports)').addClass('active');
    });
}());