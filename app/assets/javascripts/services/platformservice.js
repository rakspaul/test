(function () {
    "use strict";
    angObj.factory("platformService", function ($http, $location, api, apiPaths, common, dataService) {
        //$http.defaults.headers.common['Authorization'] = $cookieStore.get('auth_token');
        return {
            getStrategyPlatformData: function (param) {
                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaignId + (param.strategyId >0 ? ('/strategies/'+ param.strategyId) : '') + '/byplatforms'+"?date_filter="+param.timeFilter;
                return dataService.fetch(url);
            }
        };
    });
}());