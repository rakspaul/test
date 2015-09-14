(function () {
    "use strict";
    angObj.factory("workflowService", function ($http,$location, api, apiPaths, dataService, $cookieStore) {
        return {
            fetchCampaigns : function() {
                var url = apiPaths.WORKFLOW_APIUrl + '/campaigns';
                return dataService.fetch(url);
            },
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
                //var url = apiPaths.WORKFLOW_APIUrl + '/campaigns/' + campaignId + '/ads';
                var url = apiPaths.WORKFLOW_APIUrl + '/campaigns/' + campaignId + '/no_ad_group/ads';
                return dataService.fetch(url);
            },
            getAdgroups : function(campaignId){
                var url = apiPaths.WORKFLOW_APIUrl + '/campaigns/' + campaignId + '/ad_groups';
                return dataService.fetch(url);

            },
            createAdGroups:function(campaignId,data){
                 return dataService.post(apiPaths.WORKFLOW_APIUrl +'/campaigns/'+campaignId+'/ad_groups', data, {'Content-Type': 'application/json'})

            },
            getAdsInAdGroup :function(campaignId,adGroupID){
                var url = apiPaths.WORKFLOW_APIUrl + '/campaigns/' + campaignId + '/ad_groups/'+adGroupID+'/ads';
                return dataService.fetch(url);
            },
            createAdGroupOfIndividualAds:function(){

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

            getTaggedCreatives : function(campaignId,adId){

            console.log("adID:"+adId+"CampaignID:"+campaignId);
                 var url= apiPaths.WORKFLOW_APIUrl +'/campaigns/'+ campaignId +'/ads/'+adId;
                 return dataService.fetch(url);
            },

            getCreativeSizes : function(){
                 var url= apiPaths.WORKFLOW_APIUrl +'/sizes';
                 return dataService.fetch(url);
            },
            saveCreatives: function(clientId,adId,data){
                     return dataService.post(apiPaths.WORKFLOW_APIUrl +'/clients/'+clientId+'/advertisers/'+adId+'/creatives', data, {'Content-Type': 'application/json'})

                var url= apiPaths.WORKFLOW_APIUrl +'/campaigns/'+ campaignId +'/ads/'+adId;
                return dataService.fetch(url);
            },

            forceSaveCreatives:function(clientId,adId,data){
               return dataService.post(apiPaths.WORKFLOW_APIUrl +'/clients/'+clientId+'/advertisers/'+adId+'/creatives?forceSave=true', data, {'Content-Type': 'application/json'})
            },

            getCreatives :  function(clientId, advertiserId, formats, query) {
                var queryStr = query ? query : '';
                var creativeFormats = formats ? '?creativeFormat='+formats : ''
                var url= apiPaths.WORKFLOW_APIUrl +'/clients/'+ clientId+'/advertisers/'+ advertiserId +'/creatives'+ creativeFormats+ queryStr;
                return dataService.fetch(url);
            },

            updateCreative : function(clientId,adId,id,data) {
                return dataService.put(apiPaths.WORKFLOW_APIUrl +'/clients/'+clientId+'/advertisers/'+adId+'/creatives/'+id, data, {'Content-Type': 'application/json'})
            },

            getRegionsList :  function(platformId, data) {
                var url = apiPaths.WORKFLOW_APIUrl + '/platforms/'+platformId+'/regions'+data;
                return dataService.fetch(url);
            },

            getCitiesList :  function(platformId, data) {
                var url = apiPaths.WORKFLOW_APIUrl + '/platforms/'+platformId+'/cities'+data;
                return dataService.fetch(url);
            },

            getDMAsList :  function(platformId, data) {
                var url = apiPaths.WORKFLOW_APIUrl + '/platforms/'+platformId+'/dmas'+data;
                return dataService.fetch(url);
            },

            getAdvertisersDomainList :  function(clientId, advertiserId) {
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/'+clientId+'/advertisers/'+advertiserId+'/domain_lists';
                return dataService.fetch(url);
            },

            createAdvertiseDomainList :  function(clientId, advertiserId) {
                return apiPaths.WORKFLOW_APIUrl +'/clients/'+clientId+'/advertisers/'+advertiserId+'/domain_lists/upload';
            }
        };

    });
}());