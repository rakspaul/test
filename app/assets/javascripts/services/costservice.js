(function () {
    "use strict";
    angObj.factory("costService", function ($http,$location, api, apiPaths, dataService) {
        //$http.defaults.headers.common['Authorization'] = $cookieStore.get('auth_token'); 
        return {

            getTacticsForStrategy: function(param){
                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaignId + '/strategies/'+ param.strategyId+'/tactics/meta' ;
                return dataService.fetch(url);
            },

            getStrategyCostData: function (param) {
                var params= 'start_date='+ param.startDate +'&end_date='+ param.endDate;
                var url = apiPaths.apiSerivicesUrl + '/campaigns/';
                if(param.strategyId) {
                    url += param.campaignId + '/strategies/'+ param.strategyId + '/costs/perf?';
                } else {
                    url += 'costs?ids='+ param.campaignId+'&';
                }
                url += params;
                return dataService.fetch(url);
            },

            getTacticCostData: function (param) {
                var url =  apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaignId+ '/strategies/'+ param.strategyId+ '/tactics/costs/perf?start_date=' + param.startDate + '&end_date=' + param.endDate ;
                return dataService.fetch(url);
            }

        };
    });
}());