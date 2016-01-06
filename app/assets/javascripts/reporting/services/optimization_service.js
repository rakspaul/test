(function () {
    "use strict";
    angObj.factory("optimizationService", function ($http,$location, api, apiPaths, dataService, loginModel) {
        //$http.defaults.headers.common['Authorization'] = $cookieStore.get('auth_token'); 
        return {

            getActionsForSelectedCampaign: function (param) {
                var clientId =  loginModel.getSelectedClient().id;
                var url = apiPaths.workflow_apiServicesUrl + '/clients/' + clientId + "/campaigns/" +  param.campaignId + "/actions" + '?date_filter=' + param.time_filter;
                return dataService.fetch(url);
            }

        };
    });
}());