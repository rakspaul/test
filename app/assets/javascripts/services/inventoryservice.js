(function () {
    "use strict";
    angObj.factory("inventoryService", function ($http,$location, api, apiPaths, common, campaign_api, dataService) {
        //$http.defaults.headers.common['Authorization'] = $cookieStore.get('auth_token'); 

        return {
            getStrategyDomainData: function (param) {
                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaign_id + '/strategies/' + param.strategyId + '/inventory/' + param.domain + '?kpi_type=' + param.kpi_type + '&date_filter=' + param.time_filter;
                return  url ;
            },

            getAllTacticDomainData: function (param) {
                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaign_id + '/strategies/' + param.strategyId + '/tactics/inventory/' + param.domain + '?kpi_type=' + param.kpi_type + '&date_filter=' + param.time_filter;
                return url ; 
            }

        };
    });
}());