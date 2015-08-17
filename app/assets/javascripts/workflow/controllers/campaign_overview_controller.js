var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('CampaignOverViewController', function ($scope, $window, $routeParams, constants, workflowService, $timeout) {
        $scope.textConstants = constants;
        $scope.workflowData = {};
        $scope.disablePushBtn = true;
        var campaignOverView = {

            modifyCampaignData :  function() {
                var campaignData = $scope.workflowData['campaignData'];
                campaignData.numOfDays = moment(campaignData.endTime).diff(moment(campaignData.startTime), 'days');
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
                        console.log(responseData);   //  $scope.disablePushBtn = !(_.indexOf(['draft'], campaignAdsData.state.toLowerCase() >0))

                        for(var index in responseData) {
                              if(responseData[index].state.toLowerCase()=="draft"){
                                console.log("index:"+index);
                                $scope.disablePushBtn=false;
                                break;
                              }
                        } console.log("outside for loop:"+$scope.disablePushBtn);
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
        
        // Switch BTN Animation
        $('.btn-toggle').click(function() {
            $(this).find('.btn').toggleClass('active');
            
            if ($(this).find('.btn-success').size()>0) {
                $(this).find('.btn').toggleClass('btn-success');
            }
            
            $(this).find('.btn').toggleClass('btn-default');
               
        });

    });
})();

