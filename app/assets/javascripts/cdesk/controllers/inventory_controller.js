var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('InventoryController', function ($scope, $http,inventoryService) {

        $scope.init = function () {
            console.log("Inside init method on inventroyController");
            $scope.selectedCampaign = {
                id: '401459',
                name: 'RE SZ WDBJ Piedmont Eye Center Q114'
            };

        $scope.strategylist($scope.selectedCampaign.id);


        };



            $scope.strategylist = function(campaignId) {

                inventoryService.getStrategiesForCampaign(campaignId).then(function(result){
                    $scope.strategies = result.data.data;

                });
            };

        //Hot fix to show the campaign tab selected
        $("ul.nav:first").find('.active').removeClass('active').end().find('li:contains(Reports)').addClass('active');
    });
}());