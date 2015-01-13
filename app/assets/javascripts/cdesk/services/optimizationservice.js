(function () {
    "use strict";
    angObj.factory("optimizationService", function ($http,$location, api, apiPaths, dataService, loginModel) {
        $http.defaults.headers.common['Authorization'] = "CollectiveAuth token=" + user_id + ":" + loginModel.getAuthToken() + " realm=\"reach-ui\"";
        return {

            getActionsForSelectedCampaign: function (param) {
                var url = apiPaths.apiSerivicesUrl + "/reports/campaigns/" +  param.campaignId + "/actions?user_id="+user_id;
                return dataService.fetch(url);
            }

        };
    });
}());