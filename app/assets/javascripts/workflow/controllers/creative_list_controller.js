var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('creativeListController', function ($scope, $window, $routeParams, constants, workflowService, $timeout, utils, $location) {
        $(".main_navigation").find('.active').removeClass('active').end().find('#creative_nav_link').addClass('active');
        $scope.textConstants = constants;
        $scope.creativeData = {};
        $scope.adData= {}
        $scope.adData.screenTypes =[];

        $scope.getAdFormatIconName = function(adFormat) {
            adFormat =  adFormat || 'display';
            var adFormatMapper = {'display' : 'picture', 'video' : 'film', 'rich media' : 'paperclip', 'social' : 'user' }
            return adFormatMapper[adFormat.toLowerCase()];
        }

        var creativeList = {
            clients :  function() {
                workflowService.getClients().then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.creativeData['clients'] =  _.sortBy(responseData, 'name');
                    }
                    else{
                        creativeList.errorHandler(result);
                    }
                }, creativeList.errorHandler);
            },

            fetchAdvertisers :  function(clientId) {
                workflowService.getAdvertisers(clientId).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.creativeData['advertisers'] =  _.sortBy(responseData, 'name');
                    }
                    else{
                        createCampaign.errorHandler(result);
                    }
                }, createCampaign.errorHandler);
            },

            getCreativesList : function(campaignId, advertiserId) {
                workflowService.getCreatives(campaignId, advertiserId).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        $scope.creativeData['creatives'] = result.data.data;
                        $scope.creativeData['creatives_count'] = result.data.data.length;
                        console.log($scope.creativeData);
                    }
                });
            },

            errorHandler : function(errData) {
                console.log(errData);
            }
        };

        $scope.campaignId = $routeParams.campaignId;
        creativeList.clients();
        creativeList.getCreativesList(3, 21);


    });
})();

