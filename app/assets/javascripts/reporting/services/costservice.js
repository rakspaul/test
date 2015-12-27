(function () {
    "use strict";
    angObj.factory("costService", function ($http,$location, api, apiPaths, dataService, loginModel) {
        //$http.defaults.headers.common['Authorization'] = $cookieStore.get('auth_token'); 
        return {

            getStrategyCostData: function (param) {
                var clientId = loginModel.getSelectedClient().id;
                var params = '&client_id=' + clientId + '&start_date=\'' + param.startDate + '\'&end_date=\'' + param.endDate + '\'';
                var url = apiPaths.apiSerivicesUrl_NEW + '/reportBuilder/customQuery';
                if(_.has(param, 'strategyId') && param.strategyId >= 0) {
                    // Specific Ad group is selected - including the Unassigned ads
                    url += '?query_id=15&campaign_id=' + param.campaignId + '&ad_group_id=' + param.strategyId;
                } else {
                    // All ad groups is selected
                    url += '?query_id=14&campaign_ids=' + param.campaignId;
                }
                url += params;
                return dataService.fetch(url);
            }

        };
    });
}());