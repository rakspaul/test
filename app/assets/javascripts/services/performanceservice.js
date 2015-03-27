(function () {
    "use strict";
    angObj.factory("performanceService", function ($http,$location, api, apiPaths, common, campaign_api, dataService) {
        //$http.defaults.headers.common['Authorization'] = $cookieStore.get('auth_token'); 
        return {
            getStrategiesForCampaign: function (campaingId) {
                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + campaingId + '/strategies/meta';
                return dataService.fetch(url);
            },

            getTacticsForStrategy: function(param){
                 var url = apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaignId + '/strategies/'+ param.strategyId+'/tactics/meta' ;
                return dataService.fetch(url);
            },

            getCampaingsForUser: function (brand_id,searchCriteria) {
                var url =  apiPaths.apiSerivicesUrl + '/campaigns/meta?brand_id='+brand_id ;
                return dataService.fetch(dataService.append(url,searchCriteria));
            },

            getStrategyPerfData: function (param) {
                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaignId+ '/strategies/'+ param.strategyId+ '/'+ param.tab + '/perf?start_date='+ param.strategyStartDate +'&end_date='+ param.strategyEndDate ;
                return dataService.fetch(url);
            },
            getStrategyPlatformData: function (param) {
                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaignId+ '/strategies/'+ param.strategyId+ '/'+ param.tab;
                return dataService.fetch(url);
            },
            getTacticPerfData: function (param) {
                 var url =  apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaignId+ '/strategies/'+ param.strategyId+ '/tactics/'+  param.tacticId +'/' + param.tab +'/perf?start_date=' + param.startDate + '&end_date=' + param.endDate ;
                return dataService.fetch(url);
            }

        };
    });
}());