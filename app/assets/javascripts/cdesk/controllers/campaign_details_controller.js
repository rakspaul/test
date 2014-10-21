/*global angObj*/
(function() {
    'use strict';

    angObj.controller('CampaignDetailsController', function($scope, $routeParams, modelTransformer, CampaignData, campaign, Campaigns, actionChart, dataService, apiPaths, actionColors, utils) {
        
        $scope.campaigns = new Campaigns();
        $scope.is_network_user = is_network_user;
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
            var actionItemsArray = [] , counter = 0;   
            var actionItems = result.data.data;
          console.log(actionItems);
          var strategyByActionId = {};
            if (actionItems.length > 0) {
                for(var i = actionItems.length-1; i >= 0; i--){
                    for(var j = actionItems[i].action.length - 1; j >= 0; j--){
                        actionItems[i].action[j].action_color = actionColors[counter % 9];
                        //actionItems[i].action[j].ad_name = actionItems[i].ad_name;
                        //actionItems[i].action[j].ad_id = actionItems[i].ad_id;
                        actionItemsArray.push(actionItems[i].action[j]);
                      strategyByActionId[actionItems[i].action[j].id] = actionItems[i];
                        counter++;
                    }
                }
              $scope.strategyByActionId = strategyByActionId;
                $scope.actionItems = actionItemsArray;
            }
        }, function(result) {
            console.log('call failed');
        });

        //$scope.details.actionChart = actionChart.lineChart();
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


        //API call for campaign chart
        dataService.getCdbChartData($routeParams.campaignId, 'lifetime', 'campaigns', null).then(function (result) {
            var lineData = [];
            if(result.status == "success" && !angular.isString(result.data)) {
                if(!angular.isUndefined($scope.campaign.kpiType)) {
                    if(result.data.data.measures_by_days.length > 0) {
                        var maxDays = result.data.data.measures_by_days;
                        for (var i = 0; i < maxDays.length; i++) {
                            var kpiType = ($scope.campaign.kpiType),
                            kpiTypeLower = angular.lowercase(kpiType);
                            lineData.push({ 'x': i + 1, 'y': utils.roundOff(maxDays[i][kpiTypeLower], 2), 'date': maxDays[i]['date'] });
                        }
                        $scope.details.actionChart = actionChart.lineChart(lineData, parseFloat($scope.campaign.kpiValue), $scope.campaign.kpiType, $scope.actionItems);
                    }
                }
            }
        });

        var filterObject = new Campaigns();
        $scope.campaigns = filterObject;
    });
}());