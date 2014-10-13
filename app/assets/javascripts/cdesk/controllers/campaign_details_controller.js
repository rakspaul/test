/*global angObj*/
(function() {
    'use strict';

    angObj.controller('CampaignDetailsController', function($scope, $routeParams, modelTransformer, CampaignData, campaign, Campaigns, actionChart, dataService, apiPaths) {
        
        $scope.campaigns = new Campaigns();
        
        var campaignList = [];
        $scope.details = {
                campaign: null,
                details: null
            }
        //API call for campaign details
        var url = "/campaigns/" + $routeParams.campaignId + ".json?filter[date_filter]=life_time";

        dataService.getSingleCampaign(url).then(function(result) {
            if (result.data) {
                var dataArr = [result.data];
                $scope.campaign = campaign.setActiveInactiveCampaigns(dataArr, 'lifetime', 'life_time')[0];
                dataService.getCampaignData('lifetime', $routeParams.campaignId).then(function(response) {
                    $scope.campaigns.cdbDataMap[$routeParams.campaignId] = modelTransformer.transform(response.data.data, CampaignData);
                });
            }
        }, function(result) {
            console.log('call failed');
        });

        var actionUrl = apiPaths.actionDetails + "/reports/campaigns/" + $routeParams.campaignId + "/actions";

        dataService.getActionItems(actionUrl).then(function(result) {
            var actionItemsArray = [];
            var actionItems = result.data.data;
            if (actionItems.length > 0) {
                for(var i=0; i<actionItems.length; i++){
                    for(var j=0; j<actionItems[i].action.length; j++){
                        actionItemsArray.push(actionItems[i].action[j]);
                    }
                }
                $scope.actionItems = actionItemsArray;
            }
        }, function(result) {
            console.log('call failed');
        });

        $scope.details.actionChart = actionChart.lineChart();
        //Function called when the user clicks on the Load more button
        $scope.loadMoreStrategies = function(campaignId) {
            var campaignArray = $scope.campaign,
                pageSize = 3;
            var loadMoreData = campaignArray.campaignStrategiesLoadMore;
            if (loadMoreData.length) {
                var moreData = loadMoreData.splice(0, pageSize)
                for (var len = 0; len < moreData.length; len++) {
                    $scope.campaign.campaignStrategies.push(moreData[len]);
                }
            }
        };



        var filterObject = new Campaigns();
        $scope.campaigns = filterObject;
    });
}());