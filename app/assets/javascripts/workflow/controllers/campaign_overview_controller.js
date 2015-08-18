var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('CampaignOverViewController', function ($scope, $window, $routeParams, constants, workflowService, $timeout) {
        $scope.textConstants = constants;
        $scope.workflowData = {};
        $scope.disablePushBtn = true;
        $scope.notPushed=false;
        $scope.sizeString="";
        var campaignOverView = {

            modifyCampaignData :  function() {
                var campaignData = $scope.workflowData['campaignData'];
                campaignData.numOfDays = moment(campaignData.endTime).diff(moment(campaignData.startTime), 'days');
            },

            getCampaignData :  function(campaignId) {
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
                        for(var index in responseData) {
                              if(responseData[index].state.toLowerCase()=="draft"){
                                $scope.disablePushBtn=false;
                                break;
                              }
                        }
                    }
                    else{
                        campaignOverView.errorHandler(result);
                    }
                }, campaignOverView.errorHandler);
            },

            pushSavedCampaign : function(campaignId) {
                workflowService.pushCampaign(campaignId).then(function (result) {
                });
            },

            errorHandler : function(errData) {
                console.log(errData);
            }
        }

        $scope.utc = function(date) {
            return moment(date).utc().valueOf()
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

        $scope.appendSizes=function(creative){
            //console.log(creative);
            if(typeof creative!='undefined'){
            if(creative.length==1){
                 $scope.sizeString=creative[0].size.size;
            }else if(creative.length>1){
                 $scope.sizeString= "";
                 for(var i in creative){
                     $scope.sizeString+= creative[i].size.size +",";
                 }
                 $scope.sizeString=$scope.sizeString.substring(0, $scope.sizeString.length - 1);
            }
            }else{
                 $scope.sizeString=constants.WF_NOT_SET;
            }
            return $scope.sizeString;
            //console.log("$scope.sizeString:"+$scope.sizeString)
        }
        
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

