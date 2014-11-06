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

            $scope.selectedStrategy = {
                id:'-1',
                name : 'No Strategy Found'
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

                    if(typeof  $scope.strategies !== 'undefined' &&  $scope.strategies.length > 0) {
                        $scope.selectedStrategy.id = $scope.strategies[0].id;
                        $scope.selectedStrategy.name = $scope.strategies[0].name;
                    }
                    console.log($scope.selectedStrategy);

                    });

                $scope.getStrategyChart({campaign_id: campaignId, strategyId: $scope.selectedCampaign.strategyId, kpi_type:$scope.selectedCampaign.kpiType});

            };

        $scope.getStrategyChart = function(param){
            inventoryService.getCategoryDataForStrategy(param).then(function(result){
                //Chart
             //   $scope. inventoryChart = columnline.highChart(result.data.data[0].inv_metrics, $scope.selectedCampaign.kpiType);

            });
        };

        $('#strategies_list').click(function(e){
            $scope.selectedStrategy.id = $(e.target).attr('value');
            $scope.selectedStrategy.name =  $(e.target).text();
            $scope.$apply();
        });

        //Hot fix to show the campaign tab selected
        $("ul.nav:first").find('.active').removeClass('active').end().find('li:contains(Reports)').addClass('active');
    });
}());