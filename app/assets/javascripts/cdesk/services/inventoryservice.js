/*global angObj*/
(function () {
    "use strict";
    angObj.factory("inventoryService", function ($http, api, apiPaths, common, campaign_api) {
        $http.defaults.headers.common['Authorization'] = "CollectiveAuth token=" + user_id + ":" + auth_token + " realm=\"reach-ui\"";
        return {
            getStrategiesForCampaign: function(campaingId){
                var url= '/campaigns/'+ campaingId +'/strategies/meta' ;
                this.fetch(url);
            },

            getCampaingsForUser: function(userId) {
                var url ='/campaigns/meta?user_id='+userId;
                this.fetch(url);
            },

            getCategoryDataForStrategy: function (param) {
                var url='/campaigns/'+ param.campaign_id+ '/strategies/'+param.strategyId+'/inventory/category?kpi_type='+param.kpi_type;
                this.fetch(url);
            },

            fetch: function (url) {
                return $http({
                    url: url,
                    method: 'GET',
                    cache: true}).then(

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
                    }
                );
            },

        };
    });
}());
