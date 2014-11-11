(function () {
    "use strict";
    angObj.factory("inventoryService", function ($http,$location, api, apiPaths, common, campaign_api) {
        $http.defaults.headers.common['Authorization'] = "CollectiveAuth token=" + user_id + ":" + auth_token + " realm=\"reach-ui\"";
        return {
            getStrategiesForCampaign: function (campaingId) {
                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + campaingId + '/strategies/meta';
                return this.fetch(url);
            },

            getCampaingsForUser: function () {
              //  var url = '/assets/cdesk/tmp/campaings.json';
                 var url =  apiPaths.apiSerivicesUrl + '/campaigns/meta?user_id='+user_id;
                return this.fetch(url);

            },

            getStrategyDomainData: function (param) {
                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaign_id + '/strategies/' + param.strategyId + '/inventory/' + param.domain + '?kpi_type=' + param.kpi_type + '&date_filter=' + param.time_filter;
                return this.fetch(url);
            },

            getAllTacticDomainData: function (param) {
                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaign_id + '/strategies/' + param.strategyId + '/tactics/inventory/' + param.domain + '?kpi_type=' + param.kpi_type + '&date_filter=' + param.time_filter;
                return this.fetch(url);
            },

            downloadReport: function (param){
                var url = 'http://localhost:9000' + '/campaigns/'+ param.campaign_id+'/inventory/'+ param.domain+'/download?aggregation_period='+ param.time_filter ;
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