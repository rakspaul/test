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

//            getInventoryDataForStrategy: function(urlPath){
//                return $http({
//                    url : urlPath ,
//                    method : 'GET',
//                    cache : false
//                }).then(function (response){
//                    return {
//                        status : "success",
//                        data : response.data.data
//
//                    };
//                }, function (error) {
//                    return {
//                        status : "error",
//                        data : error
//                    };
//                });
//
//            },


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
