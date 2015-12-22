(function () {
    "use strict";
    angObj.factory("inventoryService", function ($http,$location, api, apiPaths, common, campaign_api, dataService,urlService) {
        //$http.defaults.headers.common['Authorization'] = $cookieStore.get('auth_token'); 

        return {
            getStrategyDomainData: function (param) {
                var url = urlService.APIVistoCustomQuery(param);
                return dataService.fetch(url);
            }
        };
    });
}());

