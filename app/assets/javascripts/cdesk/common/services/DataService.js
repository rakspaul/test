/*global angObj*/
(function () {
  "use strict";
  commonModule.factory("dataService", function ($q, $http, api, apiPaths, common, campaign_api, dataTransferService, dataStore, utils, urlService) {
    //$http.defaults.headers.common['Authorization'] = userService.getUserDetails('token');
    // $http.defaults.headers.common.Authorization = userService.getUserDetails('token');
    $http.defaults.headers.common['Authorization'] = "CollectiveAuth token=" + user_id + ":" + auth_token + " realm=\"reach-ui\"";
    return {

      getSingleCampaign: function (urlPath) {
        return this.fetch(urlPath)
      },

      getActionItems: function (urlPath) {
        return this.fetch(urlPath)
      },

      getCampaignStrategies: function (urlPath, type) {
        var apiUrl;
        if (type == 'metrics') {
          apiUrl = api + urlPath;
        } else if (type == 'list') {
          apiUrl = urlPath;
        }
        return this.fetch(apiUrl)
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
        return this.fetch(urlPath);
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
        return this.fetch(url);
      },

      getCostViewability: function(campaign, timePeriod) {
        var url = apiPaths.apiSerivicesUrl + '/campaigns/' + campaign.orderId + '/viewReport?date_filter=' + timePeriod;
        return this.fetch(url);
      },

      getCostInventoryData: function(campaign, timePeriod) {
        // for testing 
        //var url = apiPaths.apiSerivicesUrl + '/campaigns/405617/inventory/categories?kpi_type=CPC';
        var url = apiPaths.apiSerivicesUrl + '/campaigns/' + campaign.orderId + '/inventory/categories?kpi_type=' + campaign.kpiType;
        console.log(url);
        return this.fetch(url);
      },

      getCostFormatsData: function(campaign,  timePeriod) {
        // for testing 
        //var url = apiPaths.apiSerivicesUrl + '/campaigns/401652/byformats/perf?date_filter=life_time'
        var url = apiPaths.apiSerivicesUrl + '/campaigns/' + campaign.orderId + '/byformats/perf?date_filter=' + timePeriod;
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

      updateLastViewedAction: function(campaignId) {
        return this.put(urlService.APIlastViewedAction(campaignId, user_id), {}).then(function(response) {
          if(response.status === "success") {
            //delete default campaign list cache here
            dataStore.deleteFromCache(urlService.APIDefaultCampaignList(user_id));
          }
        })
      },

      fetch: function (url) {
        var cachedResponse = dataStore.getCachedByUrl(url);
        if(cachedResponse != undefined) {
          var defer = $q.defer();
          var promise = defer.promise.then(function () {
            //here we always return a clone of original object, so that if any modifications are done it will be done on clone and original will remain unchanged
            return utils.clone(cachedResponse.value);
          });
          defer.resolve();
          return promise;
        }
        return $http({url: url, method: 'GET', cache: true}).then(
          function (response) {
            var objOnSuccess = {
              status: "success",
              data: response.data
            };
            dataStore.cacheByUrl(url, objOnSuccess)
            return utils.clone(objOnSuccess);
          },
          function (error) {
            return {
              status: "error",
              data: error
            };
          }
        );
      },

      fetchCancelable: function (url, canceller, success, failure) {
        var cachedResponse = dataStore.getCachedByUrl(url);
        if(cachedResponse != undefined) {
          var defer = $q.defer();
          var promise = defer.promise.then(function () {
            return success.call(this, utils.clone(cachedResponse.value));
          });
          defer.resolve();
          return promise;
        }
        return $http.get(url, {timeout: canceller.promise}).then(
          function (response) {
            var objOnSuccess = {
              status: "success",
              data: response.data
            };
            dataStore.cacheByUrl(url, objOnSuccess)
            return success.call(this, utils.clone(objOnSuccess));
          },
          function (error) {
            var objOnError = {
              status: "error",
              data: error
            }
            if(failure != undefined) {
              return failure.call(this, objOnError);
            } else return objOnError
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
      },

      put: function (url, data) {
        return $http.put(url, angular.toJson(data)).then(
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
