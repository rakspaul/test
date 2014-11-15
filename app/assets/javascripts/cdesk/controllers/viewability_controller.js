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

        $scope.selected_filters = {
            time_filter: 'life_time',
            time_filter_text: 'Life Time',
            kpi_type: 'CPA',
            kpi_type_text: 'CPA'
        };

        $scope.filters = utils.reportsDropDowns();


        //Function called to draw the Strategy chart
        $scope.getStrategyChart = function (param) {
            inventoryService.getStrategyDomainData(param).then(function (result) {
                if (result.status === "OK" || result.status === "success") {

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

            $scope.getStrategyChart({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, domain: $scope.selected_filters.domain, time_filter: $scope.selected_filters.time_filter });

        };

        ///////////////////////////////////////////////////////////////////////////////////////////////////////
        //Campaign Strategy List
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        $scope.setCampaignStrategyList = function(campaigns){
            $scope.campaingns = campaigns;
            if (typeof  $scope.campaingns !== 'undefined' && $scope.campaingns.length > 0) {
                //Maintain the selected campaign name and id;
                $scope.selectedCampaign.id =  dataTransferService.getClickedCampaignId() ? dataTransferService.getClickedCampaignId() : $scope.campaingns[0].campaign_id;
                $scope.selectedCampaign.name = dataTransferService.getClickedCampaignName() ? dataTransferService.getClickedCampaignName() :  $scope.campaingns[0].name;
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
                    $scope.selectedStrategy.id =  dataTransferService.getClickedStrategyId() ? dataTransferService.getClickedStrategyId() : $scope.strategies[0].id;
                    $scope.selectedStrategy.name = dataTransferService.getClickedStrategyName() ? dataTransferService.getClickedStrategyName() : $scope.strategies[0].name;
                    //Call the chart to load with the changed campaign id and strategyid
                    /*$scope.chartForStrategy=true;
                    $scope.loadCdbDataForStrategy()*/
                }
                else { //  means empty strategy list
                    $scope.selectedStrategy.id = -1;
                    $scope.selectedStrategy.name = "No Strategy Found";
                    $scope.chartForStrategy=false;
                }
            });
        };

        $scope.campaignlist();

        //Function called when the user clicks on the campaign dropdown
        $('#campaigns_list').click(function (e) {
            var id = $(e.target).attr('value'), txt = $(e.target).text();
            $scope.selectedCampaign.id = id;
            $scope.selectedCampaign.name = txt;
            dataTransferService.updateExistingStorageObjects({'campaignId' : id, 'campaignName' :  txt});
            $scope.$apply();

            if($scope.selectedCampaign.id !== -1) {
                $scope.chartForStrategy=true;
                $scope.strategylist($scope.selectedCampaign.id);
            }
            else{
                $scope.chartForStrategy=false;
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
               /* $scope.chartForStrategy=true;
                $scope.loadCdbDataForStrategy();*/
            }
        });
        
        //Hot fix to show the campaign tab selected
        $("ul.nav:first").find('.active').removeClass('active').end().find('li:contains(Reports)').addClass('active');
    });
}());