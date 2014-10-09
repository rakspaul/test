/*global angObj*/
(function () {
    'use strict';

    angObj.controller('CampaignDetailsController', function($scope, $routeParams, campaign, Campaigns, actionChart, dataService, apiPaths) {

        var campaignList = [];
        $scope.details = {
            campaign: null,
            details: null
        }
        //API call for campaign details
        var url= "/campaigns.js?page=2&filter[date_filter]=life_time&callback=JSON_CALLBACK";
        console.log('calling--: ' + url);

        dataService.getCampaignActiveInactive(url).then(function(result) {
            if (result.data.orders.length > 0) {
                angular.forEach(campaign.setActiveInactiveCampaigns(result.data.orders, 'last_7_days', 'last_week'), function(campaign) {
                    this.push(campaign);
                    $scope.campaign = campaign;
                }, campaignList);
            }
        }, function(result) {
            console.log('call failed');
        });

        var actionUrl= apiPaths.actionDetails + "/reports/campaigns/1723/actions";
        console.log('calling--: ' + actionUrl);

        dataService.getActionItems(actionUrl).then(function(result) {
            console.log('result from the call: ');
            console.log(result.data);
            /*if (result.data.orders.length > 0) {
                angular.forEach(campaign.setActiveInactiveCampaigns(result.data.orders, 'last_7_days', 'last_week'), function(campaign) {
                    this.push(campaign);
                    $scope.campaign = campaign;
                }, campaignList);
            }*/
        }, function(result) {
            console.log('call failed');
        });


        $scope.details.actionChart = actionChart.lineChart();
        //Function called when the user clicks on the Load more button
        $scope.loadMoreStrategies = function (campaignId) {
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