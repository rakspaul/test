(function () {
    "use strict";
    angObj.factory("performanceService", function ($http,$location, api, apiPaths, common, campaign_api) {
        $http.defaults.headers.common['Authorization'] = "CollectiveAuth token=" + user_id + ":" + auth_token + " realm=\"reach-ui\"";
        return {
            getStrategiesForCampaign: function (campaingId) {
                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + campaingId + '/strategies/meta';
                return this.fetch(url);
            },

            getTacticsForStrategy: function(param){
                 var url = apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaignId + '/strategies/'+ param.strategyId+'/tactics/meta' ;
                return this.fetch(url);
            },

            getCampaingsForUser: function () {
                var url =  apiPaths.apiSerivicesUrl + '/campaigns/meta?user_id=' + user_id ;
                return this.fetch(url);

            },

            getStrategyPerfData: function (param) {
                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaignId+ '/strategies/'+ param.strategyId+ '/'+ param.tab + '/perf?start_date='+ param.strategyStartDate +'&end_date='+ param.strategyEndDate ;
                return this.fetch(url);
            },

            getTacticPerfData: function (param) {
                 var url =  apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaignId+ '/strategies/'+ param.strategyId+ '/tactics/'+  param.tacticId +'/' + param.tab +'/perf?start_date=' + param.startDate + '&end_date=' + param.endDate ;
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