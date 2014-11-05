var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('InventoryController', function ($scope, $http,inventoryService, columnline) {

        $scope.init = function () {
            console.log("Inside init method on inventroyController");
            $scope.selectedCampaign = {
                id: '401459',
                name: 'RE SZ WDBJ Piedmont Eye Center Q114',
               strategyId: '22281',
                kpiType:'CPA'
            };

        $scope.campaignlist();
        $scope.strategylist($scope.selectedCampaign.id);

        };

        $scope.campaignlist = function(){
             inventoryService.getCampaingsForUser().then(function(result){
               $scope.campaingns = result.data.data;
                 console.log($scope.campaingns);
            });
        };



            $scope.strategylist = function(campaignId) {
                inventoryService.getStrategiesForCampaign(campaignId).then(function(result){
                    $scope.strategies = result.data.data;
                });
                $scope.getStrategyChart({campaign_id: campaignId, strategyId: $scope.selectedCampaign.strategyId, kpi_type:$scope.selectedCampaign.kpiType});

            };

        $scope.getStrategyChart = function(param){
            inventoryService.getCategoryDataForStrategy(param).then(function(result){
                //Chart
                $scope. inventoryChart = columnline.highChart(result.data.data[0].inv_metrics, $scope.selectedCampaign.kpiType);

            });
        };


        //$scope. inventoryChart= columnline.highChart();
        //Hot fix to show the campaign tab selected
        $("ul.nav:first").find('.active').removeClass('active').end().find('li:contains(Reports)').addClass('active');
    });
}());