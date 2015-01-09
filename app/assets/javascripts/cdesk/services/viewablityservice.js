(function () {
    "use strict";
    angObj.factory("viewablityService", function ($http,$location, api, apiPaths, common, campaign_api, dataService) {
        $http.defaults.headers.common['Authorization'] = "CollectiveAuth token=" + user_id + ":" + auth_token + " realm=\"reach-ui\"";
        return {

            getStrategyViewData : function (param) {
                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaign_id + '/strategies/' + param.strategyId + '/viewReport?date_filter=' + param.time_filter;
                return dataService.fetch(url);
            },

            getTacticsViewData : function (param) {
                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaign_id + '/strategies/' + param.strategyId + '/tactics/viewReport?date_filter=' + param.time_filter;
                return dataService.fetch(url);
            }

        };
    });
}());