/*global angObj*/
(function() {
    'use strict';

    angObj.controller('CampaignDetailsController', function($scope, $routeParams, campaign, Campaigns, actionChart, dataService, apiPaths) {

        var campaignList = [];
        $scope.details = {
                campaign: null,
                details: null
            }
            //API call for campaign details
        var url = "/campaigns/" + $routeParams.campaignId + ".json";
        console.log('calling--: ' + url);

        dataService.getSingleCampaign(url).then(function(result) {
            console.log(result);
            if (result.data) {
                var dataArr = [result.data];

                $scope.campaign = campaign.setActiveInactiveCampaigns(dataArr, 'last_7_days', 'last_week')[0];


            }



        }, function(result) {
            console.log('call failed');
        });

        var actionUrl = apiPaths.actionDetails + "/reports/campaigns/1723/actions";
        console.log('calling--: ' + actionUrl);

        dataService.getActionItems(actionUrl).then(function(result) {
            console.log('result from the call: ');
            console.log(result.data);
            var actionItemsArray = [];
            //var result= {"status":"OK","status_code":200,"meta":{"host":"dev-desk.collective-media.net:9000","method":"GET","path":"/reports/campaigns/1723/actions","uri":"/reports/campaigns/1723/actions"},"data":[{"ad_id":34,"ad_name":"Blackberry Boom 160","action":[{"id":1,"comment":"Optimization -Geo Targetting","metric_impacted":"CTR","make_external":true,"action_type_id":1,"action_type_name":"Optimization","action_sub_types":[{"id":8,"name":"Geo"},{"id":9,"name":"Domain"}],"created_by_id":35,"created_by_name":"Boris Boroda","created_at":1412850417657,"metric_value_before":1000,"metric_value_after":1100,"metric_percent_change":10},{"id":24,"comment":"Optimization -Geo Targetting","metric_impacted":"CTR","make_external":true,"action_type_id":1,"action_type_name":"Optimization","action_sub_types":[{"id":8,"name":"Geo"},{"id":9,"name":"Domain"}],"created_by_id":35,"created_by_name":"Boris Boroda","created_at":1412850417657,"metric_value_before":1000,"metric_value_after":1100,"metric_percent_change":10},{"id":34,"comment":"Optimization -Geo Targetting","metric_impacted":"CTR","make_external":true,"action_type_id":1,"action_type_name":"Optimization","action_sub_types":[{"id":8,"name":"Geo"},{"id":9,"name":"Domain"}],"created_by_id":35,"created_by_name":"Boris Boroda","created_at":1412850417657,"metric_value_before":1000,"metric_value_after":1100,"metric_percent_change":10}]},{"ad_id":3,"ad_name":"Blackberry Boom 160","action":[{"id":1,"comment":"Optimization -Geo Targetting","metric_impacted":"CTR","make_external":true,"action_type_id":1,"action_type_name":"Optimization","action_sub_types":[{"id":8,"name":"Geo"},{"id":9,"name":"Domain"}],"created_by_id":35,"created_by_name":"Boris Boroda","created_at":1412850417657,"metric_value_before":1000,"metric_value_after":1100,"metric_percent_change":10},{"id":2,"comment":"Optimization -Geo Targetting","metric_impacted":"CTR","make_external":true,"action_type_id":1,"action_type_name":"Optimization","action_sub_types":[{"id":8,"name":"Geo"},{"id":9,"name":"Domain"}],"created_by_id":35,"created_by_name":"Boris Boroda","created_at":1412850417657,"metric_value_before":1000,"metric_value_after":1100,"metric_percent_change":10},{"id":3,"comment":"Optimization -Geo Targetting","metric_impacted":"CTR","make_external":true,"action_type_id":1,"action_type_name":"Optimization","action_sub_types":[{"id":8,"name":"Geo"},{"id":9,"name":"Domain"}],"created_by_id":35,"created_by_name":"Boris Boroda","created_at":1412850417657,"metric_value_before":1000,"metric_value_after":1100,"metric_percent_change":10}]}],"message":"success"};
            //var actionItems = result.data;
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