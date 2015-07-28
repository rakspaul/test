var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('CampaignOverViewController', function ($scope, $window, $routeParams, constants, workflowService, $timeout) {
        $scope.textConstants = constants;
        $scope.workflowData = {};
console.log("heloo");
        var campaignOverView = {
            getCampaignData :  function(campaignId) {
                console.log("campaignId"+campaignId);
                workflowService.getCampaignData(campaignId).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        workflowData['campaignData'] = responseData;
                        conso
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


        campaignOverView.getCampaignData($routeParams.campaignId);

        $(function() {

            $('.btn-toggle').click(function() {
                $(this).find('.btn').toggleClass('active');

                if ($(this).find('.btn-primary').size()>0) {
                    $(this).find('.btn').toggleClass('btn-primary');
                }
                if ($(this).find('.btn-success').size()>0) {
                    $(this).find('.btn').toggleClass('btn-success');
                }
                $(this).find('.btn').toggleClass('btn-default');

            });
        })


    });
})();

