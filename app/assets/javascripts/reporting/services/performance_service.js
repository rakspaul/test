(function () {
    "use strict";
    angObj.factory("performanceService", function ($http,$location, api, apiPaths, common, campaign_api, dataService) {
        //$http.defaults.headers.common['Authorization'] = $cookieStore.get('auth_token'); 
        return {
            getStrategiesForCampaign: function (campaingId) {
                var url = apiPaths.apiSerivicesUrl_NEW + '/campaigns/' + campaingId + '/ad_groups/meta';
                return dataService.fetch(url);
            },

            getCampaingsForUser: function (brand_id,searchCriteria) {
                var url =  apiPaths.apiSerivicesUrl + '/campaigns/meta?brand_id='+brand_id ;
                return dataService.fetch(dataService.append(url,searchCriteria));
            },

            getStrategyPerfData: function (param) {
                var params= '?start_date='+ param.strategyStartDate +'&end_date='+ param.strategyEndDate +"&date_filter="+param.timeFilter;
                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaignId;
                if(param.strategyId) {
                    url += '/strategies/'+ param.strategyId;
                }
                url += '/'+ param.tab+ '/perf'+ params;
                return dataService.fetch(url);
            },

            getStrategyPlatformData: function (param) {
                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaignId+ (param.strategyId ? ('/strategies/'+ param.strategyId) : '') + '/'+ param.tab;
                return dataService.fetch(url);
            }
        };
    });
}());