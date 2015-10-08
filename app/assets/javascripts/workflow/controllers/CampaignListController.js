(function() {
    'use strict';

    campaignListModule.controller('workFlowCampaignListController', function($scope, $location, workflowService) {
        $(".main_navigation").find('.active').removeClass('active').end().find('#campaigns_nav_link').addClass('active');
        localStorage.setItem('campaignData','');

        $scope.utc = function (date) {
            return moment(date).utc().valueOf()
        }

        var fetchAllCampaigns =  function() {
            workflowService.fetchCampaigns().then(function (result) {
                $scope.campaignData = result.data.data;
            });
        }

        fetchAllCampaigns();

        $scope.editCampaign=function(event, campaign){  console.log(campaign);
            event.preventDefault();
            $location.url('/campaign/'+campaign.id+'/edit')
            localStorage.setItem('campaignData',JSON.stringify(campaign));
            console.log(localStorage.getItem('campaignData'));

        }
    });

}());