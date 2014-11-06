var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('InventoryController', function ($scope, $http,inventoryService, columnline) {

        $scope.selectedCampaign = {
            id: '-1',
            name: 'No Campaign Found'
        };

        $scope.selectedStrategy = {
            id:'-1',
            name : 'No Strategy Found'
        };

        $scope.selected_filters ={
            time_filter:'lifetime',
            kpi_type:'CPA',
            tb:'1'
        };

        $scope.strategyTable = {
            topPerformance:[],
            bottomPerformance:[],
            show:'Top',
            cssClass:'top_perf_symbol'
        };

        $scope.init = function () {
            $scope.campaignlist();
        };

        $scope.campaignlist = function(){
             inventoryService.getCampaingsForUser().then(function(result){
               $scope.campaingns = result.data.data;

                 if(typeof  $scope.campaingns !== 'undefined' &&  $scope.campaingns.length > 0) {
                     $scope.selectedCampaign.id = $scope.campaingns[0].campaign_id;
                     $scope.selectedCampaign.name = $scope.campaingns[0].name;
                     console.log("selected campaing is ")
                     console.log($scope.selectedCampaign);
                 }
                 if($scope.selectedCampaign.id !== -1) {
                     console.log("Get strategy method is called" + $scope.selectedCampaign.id);
                     $scope.strategylist($scope.selectedCampaign.id);
                 }
             });
        };

            $scope.strategylist = function(campaignId) {
                console.log("inside strategy Mehtod . camaing id "+ campaignId)
                    inventoryService.getStrategiesForCampaign(campaignId).then(function (result) {

                        $scope.strategies = result.data.data;

                        if (typeof  $scope.strategies !== 'undefined' && $scope.strategies.length > 0) {
                            $scope.selectedStrategy.id = $scope.strategies[0].id;
                            $scope.selectedStrategy.name = $scope.strategies[0].name;
                        }
                        console.log($scope.selectedStrategy);

                    });

                    $scope.getStrategyChart({campaign_id: $scope.selectedCampaign.id, strategyId:  $scope.selectedStrategy.id, kpi_type:  $scope.selected_filters.kpi_type });

            };

        $scope.inventoryChart = true;
        //Function called to draw the Strategy chart
        $scope.getStrategyChart = function(param){
            inventoryService.getCategoryDataForStrategy(param).then(function(result){
                var resultTableData = result.data.data[0].inv_metrics;

                for(var data in resultTableData){
                    if(resultTableData[data].tb === 1){
                        $scope.strategyTable.topPerformance.push(resultTableData[data]);

                    }else{
                        $scope.strategyTable.bottomPerformance.push(resultTableData[data]);
                    }
                }
                //Default show the top performance strategies
                $scope.strategyTableData = $scope.strategyTable.topPerformance;
                $scope. inventoryChart = columnline.highChart($scope.strategyTableData, $scope.selectedCampaign.kpiType);
                if($scope. inventoryChart === undefined || $scope. inventoryChart === null || resultTableData === undefined) {
                    $scope.inventoryChart = false;
                }
            });
        };

        //Function called when the user clicks on the 'Top performance' button
        $scope.showPerformance = function(flag){
            if(flag === 'Top'){
                $scope.strategyTableData = $scope.strategyTable.bottomPerformance;
                $scope.strategyTable.show='Bottom';
                $scope.strategyTable.cssClass='';
            }else{
                $scope.strategyTableData = $scope.strategyTable.topPerformance
                $scope.strategyTable.show='Top';
                $scope.strategyTable.cssClass='top_perf_symbol';
            }
            $scope. inventoryChart = columnline.highChart($scope.strategyTableData, $scope.selectedCampaign.kpiType);
        };

        $('#strategies_list').click(function(e){
            $scope.selectedStrategy.id = $(e.target).attr('value');
            $scope.selectedStrategy.name =  $(e.target).text();
            $scope.$apply();
        });
        $('#campaigns_list').click(function(e){
            $scope.selectedCampaign.id = $(e.target).attr('value');
            $scope.selectedCampaign.name =  $(e.target).text();
            $scope.$apply();
        });

        //Hot fix to show the campaign tab selected
        $("ul.nav:first").find('.active').removeClass('active').end().find('li:contains(Reports)').addClass('active');
    });
}());