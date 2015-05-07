(function () {
    "use strict";
    angObj.factory("platformService", function ($http,$location, api, apiPaths, common, campaign_api, dataService) {
        //$http.defaults.headers.common['Authorization'] = $cookieStore.get('auth_token');
        return {
            getStrategyPlatformData: function (param) {
                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaignId+ (param.strategyId ? ('/strategies/'+ param.strategyId) : '') + '/'+ param.tab;
                return dataService.fetch(url);
            }
        };
    });
}());