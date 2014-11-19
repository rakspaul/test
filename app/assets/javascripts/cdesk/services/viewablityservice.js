(function () {
    "use strict";
    angObj.factory("viewablityService", function ($http,$location, api, apiPaths, common, campaign_api) {
        $http.defaults.headers.common['Authorization'] = "CollectiveAuth token=" + user_id + ":" + auth_token + " realm=\"reach-ui\"";
        return {
            getStrategiesForCampaign: function (campaingId) {
                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + campaingId + '/strategies/meta';
                return this.fetch(url);
            },
            getCampaingsForUser: function () {
                 var url =  apiPaths.apiSerivicesUrl + '/campaigns/meta?user_id='+user_id;
                return this.fetch(url);

            },
            getViewablityStrategies : function (param) {
                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaign_id + '/strategies/' + param.strategyId + '/viewReport?date_filter=' + param.time_filter;
                return this.fetch(url);
            },
            getViewablityStrategiesTactics : function (param) {
                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaign_id + '/strategies/' + param.strategyId + '/tactics/viewReport?date_filter=' + param.time_filter;
                return this.fetch(url);
            },
            downloadReport: function (param){
                var url = 'http://localhost:9000' + '/campaigns/'+ param.campaign_id+'/inventory/'+ param.domain+'/download?aggregation_period='+ param.time_filter ;
                return this.fetch(url);
            },
            fetch: function (url) {
                return $http({
                    url: url,
                    method: 'GET',
                    cache: false}).then(
                    function (response) {
                        return {
                            status: "success",
                            data: response.data
                        };
                    },
                    function (error) {
                        return {
                            status: "error",
                            data: error
                        };
                    });
            }

        };
    });
}());