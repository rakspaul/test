/*global angObj*/
(function () {
    "use strict";
    angObj.factory("inventoryService", function ($http, api, apiPaths, common, campaign_api) {
        $http.defaults.headers.common['Authorization'] = "CollectiveAuth token=" + user_id + ":" + auth_token + " realm=\"reach-ui\"";
        return {
            getStrategiesForCampaign: function(campaingId) {
               var url='http://localhost:3000/assets/cdesk/tmp/strategy_selected.json';
               // var url = apiPaths.apiSerivicesUrl + '/campaigns/' + campaingId + '/strategies/meta';
                return this.fetch(url);
            },

            getCampaingsForUser: function() {
               var url ='http://localhost:3000/assets/cdesk/tmp/campaings.json';
                //var url =  apiPaths.apiSerivicesUrl + '/campaigns/meta?user_id='+user_id;
                return this.fetch(url);

            },

            getCategoryDataForStrategy: function (param) {
                console.log(param);
                var url = 'http://localhost:3000/assets/cdesk/tmp/chart.json';
                //var url= apiPaths.apiSerivicesUrl +'/campaigns/'+ param.campaign_id+ '/strategies/'+param.strategyId+'/inventory/'+param.domain+'?kpi_type='+param.kpi_type;

                return this.fetch(url);
            },

            getAllTacticDomainData:function (param) {
                console.log(param);
                var url = 'http://localhost:3000/assets/cdesk/tmp/tactic_category.json';
               // var url=apiPaths.apiSerivicesUrl + '/campaigns/'+ param.campaign_id + '/strategies/'+ param.strategy_id + '/tactics/inventory/' + param.domain+ '?kpi_type='+param.kpi_type ;
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
