(function() {
    'use strict';

    campaignListModule.controller('campaignListTableController', function($scope, dataService) {
        $scope.campaignData;
        console.log("hello");
        fetchAllCampaigns();

        $scope.utc = function (date) {
            return moment(date).utc().valueOf()
        }
         function fetchAllCampaigns(){
             dataService.fetch("http://dev-workflow002.ewr004.collective-media.net:9009/api/wf/v2/campaigns").then(function(res){
                 $scope.campaignData = res.data.data;
                 console.log($scope.campaignData);

            });

        }


    });

}());