(function () {
    "use strict";
    angObj.factory("optimizationService", function ($http,$location, api, apiPaths, dataService) {
        //$http.defaults.headers.common['Authorization'] = $cookieStore.get('auth_token'); 
        return {

            getActionsForSelectedCampaign: function (param) {
                var url = apiPaths.apiSerivicesUrl + "/reports/campaigns/" +  param.campaignId + "/actions?user_id="+user_id;
                return dataService.fetch(url);
            }

        };
    });
}());