(function () {
    "use strict";
    angObj.factory("workflowService", function ($http,$location, api, apiPaths, dataService, loginModel, $cookieStore,requestCanceller,constants,$rootScope) {
        var mode;
        var adDetails;
        var newCreative;
        var platform;
        var vistoModule;

        return {
            fetchCampaigns : function() {
                var clientId =  loginModel.getSelectedClient().id;
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId +'/campaigns';
                return dataService.fetch(url);
            },
            getClients: function () {
                var url = apiPaths.WORKFLOW_APIUrl + '/clients';
                return dataService.fetch(url, {cache:false});
            },

            getClientData: function (clientId) {
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/'+clientId;
                return dataService.fetch(url, {cache:false});
            },

            getAdvertisers: function (clientId) {
                var clientId =  loginModel.getSelectedClient().id;
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/advertisers';
                return dataService.fetch(url);
            },
            getBrands: function (clientId, advertiserId) {
                var clientId =  loginModel.getSelectedClient().id;
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId +'/advertisers/' + advertiserId + '/brands';
                return dataService.fetch(url);
            },
            saveCampaign: function (data) {
                var clientId =  loginModel.getSelectedClient().id;
                return dataService.post(apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/campaigns', data, {'Content-Type': 'application/json'})
            },
            updateCampaign : function(data,id) {
                var clientId =  loginModel.getSelectedClient().id;
                return dataService.put(apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/campaigns/'+id, data, {'Content-Type': 'application/json'})
            },
            getCampaignData : function(campaignId) {
                var clientId =  loginModel.getSelectedClient().id;
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/campaigns/' + campaignId;
                return dataService.fetch(url, {cache:false});
            },
            getPlatforms:function(cacheObj){
                var clientId =  loginModel.getSelectedClient().id;
                var url = apiPaths.WORKFLOW_APIUrl +  '/clients/' + clientId + '/platforms?sortBy=displayName';
                return dataService.fetch(url,cacheObj);
            },
            getAdsForCampaign : function(campaignId) {
                var clientId =  loginModel.getSelectedClient().id;
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/campaigns/' + campaignId + '/no_ad_group/ads';
                return dataService.fetch(url, {cache:false});
            },
            getAdgroups : function(campaignId){
                var clientId =  loginModel.getSelectedClient().id;
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/campaigns/' + campaignId + '/ad_groups';
                return dataService.fetch(url, {cache:false});
            },

            createAdGroups:function(campaignId,data){
                var clientId =  loginModel.getSelectedClient().id;
                return dataService.post(apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/campaigns/'+campaignId+'/ad_groups', data, {'Content-Type': 'application/json'})
            },

            getAdsInAdGroup :function(campaignId,adGroupID){
                var clientId =  loginModel.getSelectedClient().id;
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/campaigns/' + campaignId + '/ad_groups/'+adGroupID+'/ads';
                return dataService.fetch(url, {cache:false});
            },

            createAdGroupOfIndividualAds:function(){

            },

            createAd : function(data) {
                var clientId =  loginModel.getSelectedClient().id;
                return dataService.post(apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/campaigns/'+data.campaignId+'/ads', data, {'Content-Type': 'application/json'})
            },

            updateAd : function(data) {
                var clientId =  loginModel.getSelectedClient().id;
                return dataService.put(apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/campaigns/'+data.campaignId+'/ads/'+data.adId, data, {'Content-Type': 'application/json'})
            },
            deleteAd : function(campaignId,adId) {
                var clientId =  loginModel.getSelectedClient().id;
                return dataService.delete(apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/campaigns/'+campaignId+'/ads/'+adId, {'Content-Type': 'application/json'})
            },
            pauseAd : function(data){
                var clientId =  loginModel.getSelectedClient().id;
                return dataService.put(apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/campaigns/'+data.campaignId+'/ads/'+data.id+'/pause', data, {'Content-Type': 'application/json'})
            },
            resumeAd : function(data){
                var clientId =  loginModel.getSelectedClient().id;
                return dataService.put(apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/campaigns/'+data.campaignId+'/ads/'+data.id+'/resume', data, {'Content-Type': 'application/json'})
            },
            deleteCampaign : function(campaignId) {
                var clientId =  loginModel.getSelectedClient().id;
                return dataService.delete(apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/campaigns/'+campaignId, {'Content-Type': 'application/json'})
            },
            getAd : function(data) {
                var clientId =  loginModel.getSelectedClient().id;
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/campaigns/'+data.campaignId+'/ads/'+data.adId;
                return dataService.fetch(url, {cache:false});
            },
            getDetailedAdsInAdGroup :function(campaignId,adGroupID,adId){
                var clientId =  loginModel.getSelectedClient().id;
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/campaigns/' + campaignId + '/ad_groups/'+adGroupID+'/ads/'+adId;
                return dataService.fetch(url, {cache:false});
            },

            pushCampaign : function(campaignId) {
                var clientId =  loginModel.getSelectedClient().id;
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/campaigns/' + campaignId + '/push';
                return dataService.fetch(url);

            },
            getTaggedCreatives : function(campaignId,adId){
                var clientId =  loginModel.getSelectedClient().id;
                var url= apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/campaigns/'+ campaignId +'/ads/'+adId;
                return dataService.fetch(url);
            },

            getCreativeSizes : function(){
                var url= apiPaths.WORKFLOW_APIUrl  +'/sizes';
                return dataService.fetch(url);
            },
            saveCreatives: function(clientId,adId,data){
                var clientId =  loginModel.getSelectedClient().id;
                return dataService.post(apiPaths.WORKFLOW_APIUrl +'/clients/'+clientId+'/advertisers/'+adId+'/creatives', data, {'Content-Type': 'application/json'})
            },

            forceSaveCreatives:function(clientId,adId,data){
                var clientId =  loginModel.getSelectedClient().id;
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
                var clientId =  loginModel.getSelectedClient().id;
                return dataService.put(apiPaths.WORKFLOW_APIUrl +'/clients/'+clientId+'/advertisers/'+adId+'/creatives/'+id, data, {'Content-Type': 'application/json'})
            },

            getRegionsList :  function(platformId, data, success, failure,flag) {
                var url = apiPaths.WORKFLOW_APIUrl + '/platforms/'+platformId+'/regions'+data;
                if(flag == 'cancellable'){
                    var canceller = requestCanceller.initCanceller(constants.CAMPAIGN_FILTER_CANCELLER);
                    return dataService.fetchCancelable(url, canceller, success, failure);
                }
                else{
                    return dataService.fetch(url);
                }
            },

            getCitiesList :  function(platformId, data, success, failure,flag) {
                var clientId =  loginModel.getSelectedClient().id;
                var url = apiPaths.WORKFLOW_APIUrl + '/platforms/'+platformId+'/cities'+data;
                if(flag == 'cancellable'){
                    var canceller = requestCanceller.initCanceller(constants.CAMPAIGN_FILTER_CANCELLER);
                    return dataService.fetchCancelable(url, canceller, success, failure);
                }
                else{
                    return dataService.fetch(url);
                }
            },

            getDMAsList :  function(platformId, data, success, failure, flag) {
                var clientId =  loginModel.getSelectedClient().id;
                var url = apiPaths.WORKFLOW_APIUrl + '/platforms/'+platformId+'/dmas'+data;
                if(flag == 'cancellable'){
                    var canceller = requestCanceller.initCanceller(constants.CAMPAIGN_FILTER_CANCELLER);
                    return dataService.fetchCancelable(url, canceller, success, failure);
                }
                else{
                    return dataService.fetch(url);
                }
            },

            getAdvertisersDomainList :  function(clientId, advertiserId) {
                var clientId =  loginModel.getSelectedClient().id;
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/'+clientId+'/advertisers/'+advertiserId+'/domain_lists';
                return dataService.fetch(url);
            },

            createAdvertiseDomainList :  function(clientId, advertiserId, domainId) {
                var clientId =  loginModel.getSelectedClient().id;
                var domainIdstr =  domainId ? '/'+domainId : '';
                return apiPaths.WORKFLOW_APIUrl +'/clients/'+clientId+'/advertisers/'+advertiserId+'/domain_lists/upload'+domainIdstr;
            },

            getPlatformCustomInputs : function(platformId) {
                var url = apiPaths.WORKFLOW_APIUrl + '/platforms/'+platformId;
                return dataService.fetch(url);
            },

            setModuleInfo : function(module) {
                vistoModule = module
            },

            getModuleInfo : function(module) {
                return vistoModule;
            },
            clearModuleInfo :  function() {
                vistoModule = null;
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
            },
            getObjectives : function(){
                var url= apiPaths.WORKFLOW_APIUrl + '/objectiveTypes';
                return dataService.fetch(url);
            },
            getVendors:function(){
                var url= apiPaths.WORKFLOW_APIUrl + '/vendors';
                return dataService.fetch(url);
            },
            getCostCategories:function(){
                var url= apiPaths.WORKFLOW_APIUrl + '/costCategories';
                return dataService.fetch(url);

            },
            getVendorForSelectedCostCategory:function(clientId,categoryId){
                var url= apiPaths.WORKFLOW_APIUrl + '/clients/'+clientId+'/costCategories/'+categoryId+'/vendors';
                return dataService.fetch(url);
            }

        };

    });
}());