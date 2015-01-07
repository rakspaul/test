(function () {
    "use strict";
    angObj.factory("costService", function ($http,$location, api, apiPaths, dataService) {
        $http.defaults.headers.common['Authorization'] = "CollectiveAuth token=" + user_id + ":" + auth_token + " realm=\"reach-ui\"";
        return {

            getTacticsForStrategy: function(param){
                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaignId + '/strategies/'+ param.strategyId+'/tactics/meta' ;
                return dataService.fetch(url);
            },

            getStrategyCostData: function (param) {
                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaignId+ '/strategies/'+ param.strategyId+ '/costs/perf?start_date='+ param.startDate +'&end_date='+ param.endDate ;
                return dataService.fetch(url);
            },

            getTacticCostData: function (param) {
                var url =  apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaignId+ '/strategies/'+ param.strategyId+ '/tactics/costs/perf?start_date=' + param.startDate + '&end_date=' + param.endDate ;
                return dataService.fetch(url);
            }

        };
    });
}());