var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('InventoryController', function ($scope, $http,inventoryService, columnline) {

        $scope.init = function () {
            console.log("Inside init method on inventroyController");
            $scope.selectedCampaign = {
                id: '401459',
                name: 'RE SZ WDBJ Piedmont Eye Center Q114'
            };

        $scope.strategylist($scope.selectedCampaign.id);


        };

            $scope.strategylist = function(campaingId) {
                console.log("inventroy_controller strategyList function ")

                inventoryService.getStrategiesForCampaign(campaingId).then(function (result) {
                    console.log("Strategies data is ");
                    console.log(result.data);

                    $scope.strategies = result.data;

                })
            };


        //Chart
       $scope. inventoryChart= columnline.highChart();
        //Hot fix to show the campaign tab selected
        $("ul.nav:first").find('.active').removeClass('active').end().find('li:contains(Reports)').addClass('active');
    });
}());