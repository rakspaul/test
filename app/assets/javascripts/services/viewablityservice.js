(function () {
    "use strict";
    angObj.factory("viewablityService", function ($http,$location, api, apiPaths, common, campaign_api, dataService) {
        return {

            getStrategyViewData : function (param) {
                //alert('in the service');
                //alert('this is param fin the service'+JSON.stringify(param));

                var params= '?date_filter=' + param.time_filter;
                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaign_id;
                if(param.strategyId) {
                    url += '/strategies/'+ param.strategyId;
                }
                url += '/viewReport' + params;
                return dataService.fetch(url);
            }
        };
    });
}());