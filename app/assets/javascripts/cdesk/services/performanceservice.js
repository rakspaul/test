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
              //  var url = 'http://dev-desk.collective-media.net:9000/dataapi/campaigns/405617/strategies/11133/tactics/meta ' ;
                 var url = apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaignId + '/strategies/'+ param.strategyId+'/tactics/meta' ;
                return this.fetch(url);
            },

            getCampaingsForUser: function () {
                //  var url = '/assets/cdesk/tmp/campaings.json';
                var url =  apiPaths.apiSerivicesUrl + '/campaigns/meta?user_id=' +user_id ;
                return this.fetch(url);

            },

            getStrategyPerfData: function (param) {
            //    var url = 'http://dev-desk.collective-media.net:9000/dataapi/campaigns/405617/strategies/11133/byscreens/perf?start_date=2014-10-01&end_date=2014-10-31';
                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaignId+ '/strategies/'+ param.strategyId+ '/byscreens/perf?start_date=2014-10-01&end_date=2014-10-31' ;     //+ param.tabName + '/perf?start_date=' + param.startDate + '&end_date=' + param.endDate ;
                return this.fetch(url);
            },

            getTacticPerfData: function (param) {
               // var url = 'http://dev-desk.collective-media.net:9000/dataapi/campaigns/405617/strategies/11133/tactics/9690049/byscreens/perf?start_date=2014-10-01&end_date=2014-10-31' ;
                 var url =  apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaignId+ '/strategies/'+ param.strategyId+ '/tactics/'+  param.tacticId +'/byscreens/perf?start_date=2014-10-01&end_date=2014-10-31' ;// + param.startDate + '&end_date=' + param.endDate ;
                 //   console.log(url);
                return this.fetch(url);
            },

//            getStrategyPerfDataByFormat: function (param) {
//                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaign_id + '/strategies/' + param.strategyId + '/inventory/' + param.domain + '?kpi_type=' + param.kpi_type + '&date_filter=' + param.time_filter;
//                return this.fetch(url);
//            },
//
//            getStrategyPerfDataByDOW: function (param) {
//                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaign_id + '/strategies/' + param.strategyId + '/inventory/' + param.domain + '?kpi_type=' + param.kpi_type + '&date_filter=' + param.time_filter;
//                return this.fetch(url);
//            },

            getAllTacticDomainData: function (param) {
                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + param.campaign_id + '/strategies/' + param.strategyId + '/tactics/inventory/' + param.domain + '?kpi_type=' + param.kpi_type + '&date_filter=' + param.time_filter;
                return this.fetch(url);
            },

            downloadReport: function (param){
                var url = apiPaths.apiSerivicesUrl + '/campaigns/'+ param.campaign_id+'/inventory/'+ param.domain+'/download?aggregation_period='+ param.time_filter ;
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