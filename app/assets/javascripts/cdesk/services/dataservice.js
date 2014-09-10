/*global angObj*/
(function () {
    "use strict";
    angObj.factory("dataService", function ($http, api,  common) {
        //$http.defaults.headers.common['Authorization'] = userService.getUserDetails('token');
       // $http.defaults.headers.common.Authorization = userService.getUserDetails('token');
        return {

            //API for campaign list //TODO: change - no parameters
            getCampaignActiveInactive : function (agencyId, advertiserId) {
                //var urlPath = (common.useTempData) ? common.useTempData +'/data.json' : api.host + '/agencies/' + agencyId + '/advertisers/' + advertiserId + '/campaigns';
                var urlPath = (common.useTempData) ? common.useTempData +'/data.json' : api+ '/campaigns.js?callback=JSON_CALLBACK';
              // console.log(urlPath);
               if(common.useTempData){
                    //mock data
                           return $http({url: urlPath , method : 'GET', cache : true
                                }).then(function (response) {
                                    // console.log(response);
                                return {
                                    status : "success",
                                    data : response.data.orders

                                };
                            }, function (error) {
                                return {
                                    status : "error",
                                    data : error
                                };
                            });
                }else{
                     // live data
                            return $http.jsonp(urlPath)
                            .success(function (data, status, headers, config){
                                return {
                                status : "success",
                                data : data.orders
                                };
                            })
                            .error(function (data, status, headers, config){
            //console.log(status+' error');
                             return {
                                status : "error",
                                data : "error"
                                };
                            
                            });

            }//end of check    

            },
             getCdbChartData : function (campaignId, advertiserId) {

                var urlPath = (common.useTempData) ? common.useTempData +'/cdb.json' : api+ '/campaigns/'+campaignId+'/bydays';

                if(common.useTempData){
                    //mock data
                           return $http({url: urlPath , method : 'GET', cache : true
                                }).then(function (response) {
                                    // console.log(response.data);
                                return {
                                    status : "success",
                                    data : response.data

                                };
                            }, function (error) {
                                return {
                                    status : "error",
                                    data : error
                                };
                            });
                }else{
                     // live data
                            return $http.jsonp(urlPath)
                            .success(function (data, status, headers, config){
                                return {
                                status : "success",
                                data : data.orders
                                };
                            })
                            .error(function (data, status, headers, config){
            //console.log(status+' error');
                             return {
                                status : "error",
                                data : "error"
                                };
                            
                            });

            }//end of check    
             }

        };
    });
}());
