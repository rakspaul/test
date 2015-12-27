(function() {
    'use strict';

    campaignListModule.controller('WorkFlowCampaignListController', function($scope,$rootScope, $location, workflowService, utils, $timeout) {
        $(".main_navigation").find('.active').removeClass('active').end().find('#campaigns_nav_link').addClass('active');
        $("html").css('background','#fff');
        localStorage.setItem('campaignData','');
        $scope.resetAlertMessage = function(){
           localStorage.removeItem('topAlertMessage');
           $rootScope.setErrAlertMessage('',0);
        }

        $scope.utc = function (date) {
            return moment(date).utc().valueOf()
        }

        var fetchAllCampaigns =  function() {
            $rootScope.setErrAlertMessage(localStorage.getItem('topAlertMessage'));
            workflowService.fetchCampaigns().then(function (result) {
                $scope.campaignData = result.data.data;
            });
        }

        $scope.convertEST = function(date,format) {
            return utils.convertToEST(date,format);
        }

        $scope.editCampaign=function(event, campaign){  //console.log(campaign);
          event.preventDefault();
          $location.url('/mediaplan/'+campaign.id+'/edit')
        }

        fetchAllCampaigns();
    });
}());
