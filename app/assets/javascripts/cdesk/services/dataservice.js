/*global angObj*/
(function () {
    "use strict";
    angObj.factory("dataService", function ($http, api,  common, campaign_api) {
        //$http.defaults.headers.common['Authorization'] = userService.getUserDetails('token');
       // $http.defaults.headers.common.Authorization = userService.getUserDetails('token');
        $http.defaults.headers.common['Authorization'] = "CollectiveAuth token=" + user_id + ":" + auth_token + " realm=\"reach-ui\"";
        return {

            //API for campaign list //TODO: change - no parameters
            getCampaignActiveInactive: function (urlPath) {
                if(common.useTempData) {
                    //mock data
                    return $http({url: urlPath , method : 'GET', cache : true}).then(
                        function (response) {
                            return {
                                status : "success",
                                data : response.data
                            };
                        },
                        function (error) {
                            return {
                                status : "error",
                                data : error
                            };
                        }
                    );
                } else {
                    // live data
                    return $http.jsonp(urlPath)
                        .success(function (data, status, headers, config) {
                            return {
                                status : "success",
                                data : data
                            };
                        })
                        .error(function (data, status, headers, config) {
                            //console.log(status+' error');
                            return {
                                status : "error",
                                data : "error"
                            };
                        });
                    }
            },

            getCampaignStrategies: function (urlPath) {
     
                    return $http({url: urlPath , method : 'GET', cache : true}).then(
                        function (response) {
                            return {
                                status : "success",
                                data : response.data
                            };
                        },
                        function (error) {
                            return {
                                status : "error",
                                data : error
                            };
                        }
                    );
               
            },

            getCdbChartData: function (campaignId, timePeriod, type, strategyId) {
                 
                if(type == 'campaigns') {
                    var urlPath = (common.useTempData) ? common.useTempData + '/cdb.json' : api + '/campaigns/' + campaignId + '/bydays?period=' + timePeriod;    
                }else if(type == 'strategies') {
                    var urlPath = (common.useTempData) ? common.useTempData + '/cdb.json' : api + '/campaigns/' + campaignId + '/strategies/' + strategyId + '/bydays?period=' + timePeriod;
                }
                if(common.useTempData) {
                    //mock data
                    return $http({url: urlPath , method : 'GET', cache : true}).then(
                        function (response) {
                            return {
                                status : "success",
                                data : response.data
                            };
                        },
                        function (error) {
                            return {
                                status : "error",
                                data : error
                            };
                        }
                    );
                } else {
                    // live data
                    return $http({url: urlPath , method : 'GET', cache : false}).then(
                        function (response) {
                            return {
                                status : "success",
                                data : response.data
                            };
                        },
                        function (error) {
                            return {
                                status : "error",
                                data : error
                            };
                        });
                }//end of check
            },

            getBrands: function() {
              var url = '/desk/advertisers.json';
              return this.makeHttpGetRequest(url);
            },

            getCampaignData: function (periodKey,campaignId) {
              var url = api + '/campaigns/' + campaignId + '?period=' + periodKey;
              return this.makeHttpGetRequest(url);
            },

            makeHttpGetRequest: function (url) {
              return $http({url: url , method: 'GET', cache: true}).then(
                function (response) {
                  return {
                    status : "success",
                    data : response.data
                  };
                },
                function (error) {
                  return {
                    status : "error",
                    data : error
                  };
                }
              );
            }
        };
    });
}());
