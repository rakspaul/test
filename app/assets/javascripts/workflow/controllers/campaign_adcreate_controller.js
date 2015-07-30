var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('CampaignAdsCreateController', function ($scope, $window, $routeParams, constants, workflowService, $timeout) {
        $scope.textConstants = constants;
        $scope.workflowData = {};
        var campaignOverView = {
            getCampaignData :  function(campaignId) {
                console.log("campaignId"+campaignId);
                workflowService.getCampaignData(campaignId).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.workflowData['campaignData'] = responseData;
                    }
                    else{
                        campaignOverView.errorHandler(result);
                    }
                }, campaignOverView.errorHandler);
            },

            errorHandler : function(errData) {
                console.log(errData);
            }
        }

        $scope.utc = function(date) {
            return Date.parse(date)
        }


        campaignOverView.getCampaignData($routeParams.campaignId);
        // Switch BTN Animation
        $('.btn-toggle').click(function(){
            $(this).find('.btn').toggleClass('active');

            if ($(this).find('.btn-primary').size()>0) {
                $(this).find('.btn').toggleClass('btn-primary');
            }
            if ($(this).find('.btn-success').size()>0) {
                $(this).find('.btn').toggleClass('btn-success');
            }
            $(this).find('.btn').toggleClass('btn-default');

        });

        // Next and Previous BTN Func
        $('.btnNext').click(function(){
            $('.nav-tabs > .active').next('li').find('a').trigger('click');
        });
          
        $('.btnPrevious').click(function(){
            $('.nav-tabs > .active').prev('li').find('a').trigger('click');
        });
        
        


    });
})();

