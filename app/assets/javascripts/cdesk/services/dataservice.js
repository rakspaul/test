/*global angObj*/
(function () {
  "use strict";
  angObj.factory("dataService", function ($http, api, apiPaths, common, campaign_api) {
    //$http.defaults.headers.common['Authorization'] = userService.getUserDetails('token');
    // $http.defaults.headers.common.Authorization = userService.getUserDetails('token');
    $http.defaults.headers.common['Authorization'] = "CollectiveAuth token=" + user_id + ":" + auth_token + " realm=\"reach-ui\"";
    return {

      //API for campaign list //TODO: change - no parameters
      getCampaignActiveInactive: function (urlPath) {
        /*if (!common.useTempData) {*/
          //mock data
          return $http({url: urlPath, method: 'GET', cache: true}).then(
            function (response) {
              return {
                status: "success",
                data: response.data.data
              };
            },
            function (error) {
              return {
                status: "error",
                data: error
              };
            }
          );
        /*} else {
          // live data
          return $http.jsonp(urlPath)
            .success(function (data, status, headers, config) {
              return {
                status: "success",
                data: data
              };
            })
            .error(function (data, status, headers, config) {
              //console.log(status+' error');
              return {
                status: "error",
                data: "error"
              };
            });
        }*/
      },
      getSingleCampaign: function (urlPath) {
        return $http({url: urlPath, method: 'GET', cache: true}).then(
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

      getActionItems: function (urlPath) {
        return $http({url: urlPath, method: 'GET', cache: true}).then(
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

      getCampaignStrategies: function (urlPath, type) {
        var apiUrl;
        if (type == 'metrics') {
          apiUrl = api + urlPath;
        } else if (type == 'list') {
          apiUrl = urlPath;
        }
        return $http({url: apiUrl, method: 'GET', cache: true}).then(
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

      getCdbChartData: function (campaignId, timePeriod, type, strategyId) {
        var urlPath;
        if (type == 'campaigns') {
          urlPath = (common.useTempData) ? common.useTempData + '/cdb.json' : api + '/campaigns/' + campaignId + '/bydays?period=' + timePeriod;
        } else if (type == 'strategies') {
          urlPath = (common.useTempData) ? common.useTempData + '/cdb.json' : api + '/campaigns/' + campaignId + '/strategies/' + strategyId + '/bydays?period=' + timePeriod;
        }
        if (common.useTempData) {
          //mock data
          return $http({url: urlPath, method: 'GET', cache: true}).then(
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
        } else {
          // live data
          return $http({url: urlPath, method: 'GET', cache: false}).then(
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
        }//end of check
      },

      getStrategyTacticList: function(strategyId){
        var url = apiPaths.apiSerivicesUrl + '/strategy/' + strategyId + '/tactics';
        return this.fetch(url);
      },

      getBrands: function () {
        var url = '/desk/advertisers.json';
        return this.fetch(url);
      },

      getActions: function () {
        var url = apiPaths.apiSerivicesUrl + '/actionTypes';
        return this.fetch(url);
      },

      getTactics: function (orderId) {
        var url = campaign_api + '/orders/' + orderId + '/ads/ads.json';
        return this.fetch(url)
      },

      getCampaignData: function (periodKey, campaignId) {
        var url = api + '/campaigns/' + campaignId + '?period=' + periodKey;
        return this.fetch(url);
      },

      createAction: function (data) {
        var url = apiPaths.apiSerivicesUrl + '/actions';
        return this.post(url, data);
      },

      fetch: function (url) {
        return $http({url: url, method: 'GET', cache: true}).then(
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

      post: function (url, data) {
        return $http({url: url, method: 'POST', cache: true, data: angular.toJson(data), headers: {'Content-Type': 'text/plain'} }).then(
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
      }
    };
  });
}());
