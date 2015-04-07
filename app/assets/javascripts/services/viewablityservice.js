(function () {
    "use strict";
    angObj.factory("viewablityService", function ($http,$location, api, apiPaths, common, campaign_api, dataService) {
        return {

            getStrategyViewData : function (param) {
                var params= '?date_filter=' + param.time_filter;
                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaign_id;
                if(param.strategyId) {
                    url += '/strategies/'+ param.strategyId;
                }
                url += '/viewReport' + params;
                return dataService.fetch(url);
            },

            getTacticsViewData : function (param) {
                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaign_id + '/strategies/' + param.strategyId + '/tactics/viewReport?date_filter=' + param.time_filter;
                return dataService.fetch(url);
            }

        };
    });
}());