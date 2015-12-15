(function () {
    "use strict";
    angObj.factory("workflowService", function ($http,$location, api, apiPaths, dataService, loginModel, $cookieStore,requestCanceller,constants,$rootScope) {
        var mode;
        var adDetails;
        var newCreative;
        var platform;
        //var clientId =  loginModel.getSelectedClient().id;
        return {
            fetchCampaigns : function() {
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId +'/campaigns';
                return dataService.fetch(url);
            },
            getClients: function () {
                var url = apiPaths.WORKFLOW_APIUrl + '/clients';
                return dataService.fetch(url, {cache:false});
            },

            getAdvertisers: function (clientId) {
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/advertisers';
                return dataService.fetch(url);
            },
            getBrands: function (clientId, advertiserId) {
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId +'/advertisers/' + advertiserId + '/brands';
                return dataService.fetch(url);
            },
            saveCampaign: function (data) {
                return dataService.post(apiPaths.WORKFLOW_APIUrl + '/campaigns', data, {'Content-Type': 'application/json'})
            },
            updateCampaign : function(data,id) {
                return dataService.put(apiPaths.WORKFLOW_APIUrl +'/campaigns/'+id, data, {'Content-Type': 'application/json'})
            },
            getCampaignData : function(campaignId) {
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/campaigns/' + campaignId;
                return dataService.fetch(url, {cache:false});
            },
            getPlatforms:function(cacheObj){
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/platforms?sortBy=displayName';
                return dataService.fetch(url,cacheObj);
            },
            getAdsForCampaign : function(campaignId) {
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/campaigns/' + campaignId + '/no_ad_group/ads';
                return dataService.fetch(url, {cache:false});
            },
            getAdgroups : function(campaignId){
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/campaigns/' + campaignId + '/ad_groups';
                return dataService.fetch(url, {cache:false});

            },

            createAdGroups:function(campaignId,data){
                return dataService.post(apiPaths.WORKFLOW_APIUrl +'/campaigns/'+campaignId+'/ad_groups', data, {'Content-Type': 'application/json'})

            },

            getAdsInAdGroup :function(campaignId,adGroupID){
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/campaigns/' + campaignId + '/ad_groups/'+adGroupID+'/ads';
                return dataService.fetch(url, {cache:false});
            },

            createAdGroupOfIndividualAds:function(){

            },

            createAd : function(data) {
                return dataService.post(apiPaths.WORKFLOW_APIUrl +'/campaigns/'+data.campaignId+'/ads', data, {'Content-Type': 'application/json'})
            },

            updateAd : function(data) {
                return dataService.put(apiPaths.WORKFLOW_APIUrl +'/campaigns/'+data.campaignId+'/ads/'+data.adId, data, {'Content-Type': 'application/json'})
            },
            deleteAd : function(campaignId,adId) {
                return dataService.delete(apiPaths.WORKFLOW_APIUrl +'/campaigns/'+campaignId+'/ads/'+adId, {'Content-Type': 'application/json'})
            },
            pauseAd : function(data){
                return dataService.put(apiPaths.WORKFLOW_APIUrl +'/campaigns/'+data.campaignId+'/ads/'+data.id+'/pause', data, {'Content-Type': 'application/json'})
            },
            resumeAd : function(data){
                return dataService.put(apiPaths.WORKFLOW_APIUrl +'/campaigns/'+data.campaignId+'/ads/'+data.id+'/resume', data, {'Content-Type': 'application/json'})
            },
            deleteCampaign : function(campaignId) {
                return dataService.delete(apiPaths.WORKFLOW_APIUrl +'/campaigns/'+campaignId, {'Content-Type': 'application/json'})
            },
            getAd : function(data) {
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/campaigns/'+data.campaignId+'/ads/'+data.adId;
                return dataService.fetch(url, {cache:false});
            },
            getDetailedAdsInAdGroup :function(campaignId,adGroupID,adId){
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/campaigns/' + campaignId + '/ad_groups/'+adGroupID+'/ads/'+adId;
                return dataService.fetch(url, {cache:false});
            },

            pushCampaign : function(campaignId) {
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/campaigns/' + campaignId + '/push';
                return dataService.fetch(url);

            },

            getTaggedCreatives : function(campaignId,adId){
                var url= apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/campaigns/'+ campaignId +'/ads/'+adId;
                return dataService.fetch(url);
            },

            getCreativeSizes : function(){
                var url= apiPaths.WORKFLOW_APIUrl +'/sizes';
                return dataService.fetch(url);
            },
            saveCreatives: function(clientId,adId,data){
                return dataService.post(apiPaths.WORKFLOW_APIUrl +'/clients/'+clientId+'/advertisers/'+adId+'/creatives', data, {'Content-Type': 'application/json'})

                var url= apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/campaigns/'+ campaignId +'/ads/'+adId;
                return dataService.fetch(url);
            },

            forceSaveCreatives:function(clientId,adId,data){
                return dataService.post(apiPaths.WORKFLOW_APIUrl +'/clients/'+clientId+'/advertisers/'+adId+'/creatives?forceSave=true', data, {'Content-Type': 'application/json'})
            },

            getCreatives :  function(clientId, advertiserId, formats, query, cacheObj,integrationTracking) {
                var queryStr = query ? query : '';
                var creativeFormats = formats ? '?creativeFormat='+formats : ''
                var integration_Tracking= integrationTracking ? '&tracking=true':''
                var url= apiPaths.WORKFLOW_APIUrl +'/clients/'+ clientId+'/advertisers/'+ advertiserId +'/creatives'+ creativeFormats+ queryStr+ integration_Tracking;
                return dataService.fetch(url, cacheObj);
            },

            updateCreative : function(clientId,adId,id,data) {
                return dataService.put(apiPaths.WORKFLOW_APIUrl +'/clients/'+clientId+'/advertisers/'+adId+'/creatives/'+id, data, {'Content-Type': 'application/json'})
            },

            getRegionsList :  function(platformId, data, success, failure,flag) {
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/platforms/'+platformId+'/regions'+data;
                if(flag == 'cancellable'){
                    var canceller = requestCanceller.initCanceller(constants.CAMPAIGN_FILTER_CANCELLER);
                    return dataService.fetchCancelable(url, canceller, success, failure);
                }
                else{
                    return dataService.fetch(url);
                }

            },

            getCitiesList :  function(platformId, data, success, failure,flag) {

                var url = apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/platforms/'+platformId+'/cities'+data;
                if(flag == 'cancellable'){
                    var canceller = requestCanceller.initCanceller(constants.CAMPAIGN_FILTER_CANCELLER);
                    return dataService.fetchCancelable(url, canceller, success, failure);
                }
                else{
                    return dataService.fetch(url);
                }
            },

            getDMAsList :  function(platformId, data, success, failure, flag) {
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/platforms/'+platformId+'/dmas'+data;
                if(flag == 'cancellable'){
                    var canceller = requestCanceller.initCanceller(constants.CAMPAIGN_FILTER_CANCELLER);
                    return dataService.fetchCancelable(url, canceller, success, failure);
                }
                else{
                    return dataService.fetch(url);
                }
            },

            getAdvertisersDomainList :  function(clientId, advertiserId) {
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/'+clientId+'/advertisers/'+advertiserId+'/domain_lists';
                return dataService.fetch(url);
            },

            createAdvertiseDomainList :  function(clientId, advertiserId, domainId) {
                var domainIdstr =  domainId ? '/'+domainId : '';
                return apiPaths.WORKFLOW_APIUrl +'/clients/'+clientId+'/advertisers/'+advertiserId+'/domain_lists/upload'+domainIdstr;
            },

            getPlatformCustomInputs : function(platformId) {
                var url = apiPaths.WORKFLOW_APIUrl + '/platforms/'+platformId;
                return dataService.fetch(url);
            },

            setMode :  function(m) {
                mode = m;
            },
            getMode: function(){
                return mode;
            },
            setAdsDetails :  function(ad) {
                adDetails = ad;
            },
            getAdsDetails: function(){
                return adDetails;
            },
            setNewCreative :  function(creative) {
                newCreative = creative;
                $rootScope.$broadcast('updateNewCreative');
            },
            getNewCreative: function(){
                return newCreative;
            },
            setPlatform :  function(m) {
                platform = m;
            },
            getPlatform: function(){
                return platform;
            }
        };

    });
}());