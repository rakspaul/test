(function() {
    'use strict';

    campaignListModule.controller('WorkFlowCampaignListController', function($scope, $location, workflowService, utils, $timeout) {
        $(".main_navigation").find('.active').removeClass('active').end().find('#campaigns_nav_link').addClass('active');
        $("html").css('background','#fff');
        localStorage.setItem('campaignData','');



        $scope.msgtimeoutReset = function(){
            $timeout(function(){
                $scope.resetAlertMessage() ;
            }, 3000);
        }

        $scope.msgtimeoutReset() ;

        $scope.close_msg_box = function(event) {
            var elem = $(event.target);
            elem.closest(".top_message_box").hide() ;
            $scope.resetAlertMessage() ;
        };

        $scope.resetAlertMessage = function(){
           localStorage.removeItem('topAlertMessage');
           $scope.alertMessage = "" ;
        }

        $scope.utc = function (date) {
            return moment(date).utc().valueOf()
        }

        var fetchAllCampaigns =  function() {
          $scope.alertMessage  = localStorage.getItem('topAlertMessage');
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
