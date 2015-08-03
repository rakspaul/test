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

            saveAd : function(data) {
                return dataService.post(apiPaths.WORKFLOW_APIUrl +'/campaigns/'+data.campaignId+'/ads', data, {'Content-Type': 'application/json'})
            },
            pushCampaign : function(campaignId) {
                var url = apiPaths.WORKFLOW_APIUrl + '/campaigns/' + campaignId + '/push';
                return dataService.fetch(url);
            }
        };

    });
}());