(function () {
    "use strict";
    angObj.factory("optimizationService", function ($http,$location, api, apiPaths, dataService) {
        //$http.defaults.headers.common['Authorization'] = $cookieStore.get('auth_token'); 
        return {

            getActionsForSelectedCampaign: function (param) {
                var url = apiPaths.workflow_apiServicesUrl + "/campaigns/" +  param.campaignId + "/actions" + '?date_filter=' + param.time_filter;;
                return dataService.fetch(url);
            }

        };
    });
}());