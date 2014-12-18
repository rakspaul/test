/*global angObj*/
(function () {
  "use strict";
  commonModule.factory("dataService", function ($http, api, apiPaths, common, campaign_api, dataTransferService) {
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

      getCdbChartData: function (campaign, timePeriod, type, strategyId) {
        var urlPath;
        var campaignId= campaign.orderId ? campaign.orderId : dataTransferService.getClickedCampaignId();
        var  durationQuery= 'period=' + timePeriod;
        if(timePeriod === 'life_time') {
          if(campaign.startDate != undefined && campaign.endDate != undefined) {
            durationQuery = 'start_date=' + campaign.startDate + '&end_date=' + campaign.endDate
          } else {
            var sd = dataTransferService.getClickedCampaignStartDate() ? dataTransferService.getClickedCampaignStartDate() : campaign.startDate;
            var ed = dataTransferService.getClickedCampaignEndDate() ? dataTransferService.getClickedCampaignEndDate() : campaign.endDate;
            durationQuery = 'start_date=' +sd  + '&end_date=' + ed;
          }
        }
        if (type == 'campaigns') {
          urlPath = (common.useTempData) ? common.useTempData + '/cdb.json' : api + '/campaigns/' + campaignId + '/bydays/perf?'+durationQuery
        } else if (type == 'strategies') {
          urlPath = (common.useTempData) ? common.useTempData + '/cdb.json' : api + '/campaigns/' + campaignId + '/strategies/' + strategyId + '/bydays/perf?'+durationQuery
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

      getCampaignCostData: function(campaignIds, filterStartDate, filterEndDate) {
        var url = apiPaths.apiSerivicesUrl + '/campaigns/costs?ids=' + campaignIds + '&start_date=' + filterStartDate + '&end_date=' + filterEndDate;
        //console.log('getting cost data : ' + url);
        return this.fetch(url);
      },

      getCampaignDashboardData: function(url) {
        return this.fetch(url);
      },

      getCdbTacticsMetrics: function(campaignId, filterStartDate, filterEndDate) {
        var url = apiPaths.apiSerivicesUrl + '/campaigns/' + campaignId + '/strategies/tactics?start_date=' + filterStartDate + '&end_date=' + filterEndDate;
        return this.fetch(url);
      },

      getCdbTacticsChartData: function(campaignId, strategyId, tacticsId, timePeriod, filterStartDate, filterEndDate) {
        var url = apiPaths.apiSerivicesUrl + '/campaigns/' + campaignId + '/strategies/' + strategyId + '/tactics/' + tacticsId + '/bydays/perf?start_date=' + filterStartDate + '&end_date=' + filterEndDate;
        return this.fetch(url);
      },

      getStrategyTacticList: function(strategyId) {
        var url = apiPaths.apiSerivicesUrl + '/strategy/' + strategyId + '/tactics';
        return this.fetch(url);
      },

      getCostBreakdown: function(campaign) {
        var url = apiPaths.apiSerivicesUrl + '/campaigns/costs?ids=' + campaign.orderId + '&start_date=' +campaign.startDate + '&end_date=' +campaign.endDate;
        console.log(url);
        return this.fetch(url);
      },

      getCostViewability: function(campaign, timePeriod) {
        var url = apiPaths.apiSerivicesUrl + '/campaigns/' + campaign.orderId + '/viewReport?date_filter=' + timePeriod;
        console.log(url);
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

      getCampaignData: function (periodKey, campaign, periodStartDate, periodEndDate) {
        var qs;
        if(periodKey === 'life_time'){
          qs = '?start_date='+campaign.startDate+'&end_date='+campaign.endDate;
        } else {
          qs = '?start_date='+periodStartDate+'&end_date='+periodEndDate;
        }
        var url = api + '/campaigns/' + campaign.orderId + '/perf' + qs;
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
