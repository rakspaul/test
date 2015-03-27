(function () {
    "use strict";
    angObj.factory("inventoryService", function ($http,$location, api, apiPaths, common, campaign_api, dataService) {
        //$http.defaults.headers.common['Authorization'] = $cookieStore.get('auth_token'); 

        return {
            getStrategyDomainData: function (param) {
                var params= '?kpi_type=' + param.kpi_type + '&date_filter=' + param.time_filter;
                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaign_id;
                if(param.strategyId) {
                    url += '/strategies/'+ param.strategyId;
                }
                url += '/inventory/'+ param.domain + params;
                return url;
            },

            getAllTacticDomainData: function (param) {
                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaign_id + '/strategies/' + param.strategyId + '/tactics/inventory/' + param.domain + '?kpi_type=' + param.kpi_type + '&date_filter=' + param.time_filter;
                return url ; 
            }

        };
    });
}());