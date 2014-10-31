/*global angObj*/
(function() {
    'use strict';

    angObj.controller('CampaignDetailsController', function($scope, $routeParams, modelTransformer, CampaignData, campaign, Campaigns, actionChart, dataService, apiPaths, actionColors, utils, dataTransferService) {


        $scope.campaigns = new Campaigns();
        $scope.is_network_user = is_network_user;
        var campaignList = [];
        $scope.details = {
                campaign: null,
                details: null,
                actionChart :true
            };
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

        var actionUrl = apiPaths.apiSerivicesUrl + "/reports/campaigns/" + $routeParams.campaignId + "/actions";

        dataService.getActionItems(actionUrl).then(function(result) {
            var actionItemsArray = [] , counter = 0;   
            var actionItems = result.data.data;
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

        $scope.loadMoreTactics = function(strategyId, campaignId) {
            var campaignArray = $scope.campaign,
                pageSize = 3;
            for(var i in campaignArray.campaignStrategies){
                if(campaignArray.campaignStrategies[i].id === parseInt(strategyId)){
                    var loadMoreData = campaignArray.campaignStrategies[i].strategyTacticsLoadMore;
                    if (loadMoreData.length) {
                        var moreData = loadMoreData.splice(0, pageSize)
                        for (var len = 0; len < moreData.length; len++) {
                            $scope.campaign.campaignStrategies[i].strategyTactics.push(moreData[len]);
                        }
                    }
                }
            }    
        };

        $scope.makeCampaignSelected = function(id) {
            var myContainer = $('#action-container:first');
            var scrollTo = $('#actionItem_' + id);
            if(scrollTo.length) {
            scrollTo.siblings().removeClass('action_selected').end().addClass('action_selected');
            myContainer.animate({
                scrollTop: scrollTo.offset().top - myContainer.offset().top + myContainer.scrollTop()
            });
            }
        };

        //API call for campaign chart
        dataService.getCdbChartData($routeParams.campaignId, 'lifetime', 'campaigns', null).then(function (result) {
            var lineData = [], showExternal = true;
            if(result.status == "success" && !angular.isString(result.data)) {
                if(!angular.isUndefined($scope.campaign.kpiType)) {
                    if(result.data.data.measures_by_days.length > 0) {
                        var maxDays = result.data.data.measures_by_days;
                        for (var i = 0; i < maxDays.length; i++) {
                            var kpiType = ($scope.campaign.kpiType),
                            kpiTypeLower = angular.lowercase(kpiType);
                            lineData.push({ 'x': i + 1, 'y': utils.roundOff(maxDays[i][kpiTypeLower], 2), 'date': maxDays[i]['date'] });
                        }
                        $scope.details.lineData = lineData;
                        $scope.details.actionChart = actionChart.lineChart(lineData, parseFloat($scope.campaign.kpiValue), $scope.campaign.kpiType, $scope.actionItems, 400, 330 , null, undefined, showExternal);

                        if((localStorage.getItem('actionSel' ) !== null)) {
                            $scope.makeCampaignSelected(localStorage.getItem('actionSel'));
                        }
                    }
                }else{
                  $scope.details.actionChart = false;
                }
            }else{
               $scope.details.actionChart = false;
            }
        });


        $scope.setOptimizationData = function( campaign, action, strategyByActionId){
            var param = {
                selectedCampaign :campaign,
                selectedStrategy : strategyByActionId[action.id],
                selectedAction : action,
                selectedActionItems : $scope.actionItems
            };

            dataTransferService.initOptimizationData(param);

            utils.goToLocation('/campaigns/' +  campaign.orderId + '/optimization');
        };

        var filterObject = new Campaigns();
        $scope.campaigns = filterObject;
        //Hot fix to show the campaign tab selected
        $("ul.nav:first").find('.active').removeClass('active').end().find('li:first').addClass('active');
    
        $scope.watchActionFilter = function(filter, showExternal) {
            $scope.details.actionChart = actionChart.lineChart($scope.details.lineData, parseFloat($scope.campaign.kpiValue), $scope.campaign.kpiType, $scope.actionItems, 400, 330 , null, undefined, showExternal);
            return filter;
        };

    });

}());