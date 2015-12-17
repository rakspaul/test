(function () {
    "use strict";
    angObj.factory("platformService", function ($http, $location, api, apiPaths, common, dataService, urlService) {
        //$http.defaults.headers.common['Authorization'] = $cookieStore.get('auth_token');
        return {
            getStrategyPlatformData: function (param) {
                var url = urlService.APIVistoCustomQuery(param);
                return dataService.fetch(url);
            }
        };
    });
}());