(function() {
    'use strict';

    campaignListModule.controller('workFlowCampaignListController', function($scope, workflowService) {
        $(".main_navigation").find('.active').removeClass('active').end().find('#campaigns_nav_link').addClass('active');

        $scope.utc = function (date) {
            return moment(date).utc().valueOf()
        }

        var fetchAllCampaigns =  function() {
            workflowService.fetchCampaigns().then(function (result) {
                $scope.campaignData = result.data.data;
            });
        }

        fetchAllCampaigns();
    });

}());