(function () {
    "use strict";
    angObj.factory("workflowService", function ($http,$location, api, apiPaths, dataService, $cookieStore) {
        return {

            getClients: function () {
                var url = apiPaths.WORKFLOW_APIUrl + '/clients';
                return dataService.fetch(url);
            },

            getAdvertisers: function (clientId) {
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/advertisers';
                return dataService.fetch(url);
            },

            getBrands: function (advertiserId) {
                var url = apiPaths.WORKFLOW_APIUrl + '/advertisers/' + advertiserId + '/brands';
                return dataService.fetch(url);
            },

            saveCampaign: function (data) {
                return dataService.post(apiPaths.WORKFLOW_APIUrl +'/campaigns', data, {'Content-Type': 'application/json'})
            },

            getCampaignData : function(campaignId) {
                var url = apiPaths.WORKFLOW_APIUrl + '/campaigns/' + campaignId;
                return dataService.fetch(url);
            },

            getAdsForCampaign : function(campaignId) {
                var url = apiPaths.WORKFLOW_APIUrl + '/campaigns/' + campaignId + '/ads';
                return dataService.fetch(url);
            },

            createAd : function(data) {
                return dataService.post(apiPaths.WORKFLOW_APIUrl +'/campaigns/'+data.campaignId+'/ads', data, {'Content-Type': 'application/json'})
            },

            updateAd : function(data) {
                return dataService.put(apiPaths.WORKFLOW_APIUrl +'/campaigns/'+data.campaignId+'/ads/'+data.adId, data, {'Content-Type': 'application/json'})
            },

            pushCampaign : function(campaignId) {
                var url = apiPaths.WORKFLOW_APIUrl + '/campaigns/' + campaignId + '/push';
                return dataService.fetch(url);

            },
//http://dev-workflow002.ewr004.collective-media.net:9009/api/wf/v2/campaigns/39/ads/adid
            getTaggedCreatives : function(campaignId,adId){
            console.log("adID:"+adId+"CampaignID:"+campaignId);
                             var url= apiPaths.WORKFLOW_APIUrl +'/campaigns/'+ campaignId +'/ads/'+adId;
                             return dataService.fetch(url);
            },
            getCreativeSizes : function(clientID,adID){
                        console.log("adID:"+adID+"ClientID:"+clientID);
                                         var url= apiPaths.WORKFLOW_APIUrl +'/clients/'+ clientID +'/advertisers/' + adID + '/creatives';
                                         return dataService.fetch(url);
            },
            saveCreatives: function(clientId,adId,data){
                return dataService.post(apiPaths.WORKFLOW_APIUrl +'/clients/'+clientId+'/advertisers/'+adId+'/creatives', data, {'Content-Type': 'application/json'})

            }
        };

    });
}());