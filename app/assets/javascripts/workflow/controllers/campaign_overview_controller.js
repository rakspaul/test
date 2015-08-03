var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('CampaignOverViewController', function ($scope, $window, $routeParams, constants, workflowService, $timeout) {
        $scope.textConstants = constants;
        $scope.workflowData = {};
        var campaignOverView = {

            modifyCampaignData :  function() {
                var campaignData = $scope.workflowData['campaignData'];
                campaignData.numOfDays = moment(campaignData.endTime).diff(moment(campaignData.startTime), 'days');
                $scope.disablePushBtn = campaignData.status.toLowerCase() !== 'draft' || campaignData.status.toLowerCase() !== 'new'
            },

            getCampaignData :  function(campaignId) {
                console.log("campaignId"+campaignId);
                workflowService.getCampaignData(campaignId).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.workflowData['campaignData'] = responseData;
                        campaignOverView.modifyCampaignData();
                    }
                    else{
                        campaignOverView.errorHandler(result);
                    }
                }, campaignOverView.errorHandler);
            },

            getAdsForCampaign :  function(campaignId) {
                workflowService.getAdsForCampaign(campaignId).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.workflowData['campaignAdsData'] = responseData;
                    }
                    else{
                        campaignOverView.errorHandler(result);
                    }
                }, campaignOverView.errorHandler);
            },

            pushSavedCampaign : function(campaignId) {
                workflowService.pushCampaign(campaignId).then(function (result) {
                    console.log(result);
                });
            },

            errorHandler : function(errData) {
                console.log(errData);
            }
        }

        $scope.utc = function(date) {
            return Date.parse(date)
        }


        $scope.getAdFormatIconName = function(adFormat) {
            var adFormatMapper = {'display' : 'picture', 'video' : 'film', 'rich media' : 'paperclip', 'social' : 'user' }
            return adFormatMapper[adFormat.toLowerCase()];
        }

        campaignOverView.getCampaignData($routeParams.campaignId);
        campaignOverView.getAdsForCampaign($routeParams.campaignId);

        $(function() {
            $("#pushCampaignBtn").on('click', function() {
                campaignOverView.pushSavedCampaign($routeParams.campaignId);
            })

        })


    });
})();

