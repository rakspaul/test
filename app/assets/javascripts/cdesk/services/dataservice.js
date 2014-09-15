/*global angObj*/
(function () {
    "use strict";
    angObj.factory("dataService", function ($http, api,  common, campaign_api) {
        //$http.defaults.headers.common['Authorization'] = userService.getUserDetails('token');
       // $http.defaults.headers.common.Authorization = userService.getUserDetails('token');
        return {

            //API for campaign list //TODO: change - no parameters
            getCampaignActiveInactive: function (timeFilter) {
                if(!timeFilter) {
                    timeFilter = "week";
                }
                var urlPath;
                if(common.useTempData) {
                    urlPath = common.useTempData + '/data.json';
                } else {

                    urlPath = campaign_api + '/campaigns.js?filter[date_filter]=last_' + timeFilter + '&callback=JSON_CALLBACK';
                }

                // console.log(urlPath);
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

            getCdbChartData: function (campaignId) {

                //var urlPath = (common.useTempData) ? common.useTempData +'/cdb.json' : api+ '/campaigns/'+campaignId+'/bydays?start_date=2014-05-01&end_date=2014-05-06';
                var urlPath = (common.useTempData) ? common.useTempData +'/cdb.json' : api+ '/campaigns/' + campaignId +'/bydays?start_date=2014-09-05&end_date=2014-09-11';
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
            }
        };
    });
}());
