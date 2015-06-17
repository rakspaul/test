/*global angObj*/
(function () {
    "use strict";
    commonModule.factory("dataService", function ($q, $http, api, apiPaths, common, campaign_api, dataStore, utils, urlService, loginModel, $cookieStore, $location, constants, analytics,_) {
        $http.defaults.headers.common['Authorization'] = loginModel.getAuthToken();
        var errorObject = {status:"error", data: {message:"Error"}};
        return {

            updateRequestHeader: function() {
                $http.defaults.headers.common['Authorization'] = loginModel.getAuthToken();
            },

            getSingleCampaign: function (urlPath) {
                return this.fetch(urlPath)
            },

            getActionItems: function (urlPath) {
                return this.fetch(urlPath);
            },

            getCampaignStrategies: function (urlPath, type) {
//        var apiUrl = api + urlPath;
//        if (type == 'metrics') {
//          apiUrl = api + urlPath;
//        } else if (type == 'list') {
//          apiUrl = urlPath;
//        }
                return this.fetch(api + urlPath)
            },

            getCdbChartData: function (campaign, timePeriod, type, strategyId) {
                var urlPath;
                var campaignId= campaign.orderId ;// dataTransferService.getClickedCampaignId();
                var  durationQuery= 'period=' + timePeriod;
                if(timePeriod === 'life_time') {
                    if(campaign.startDate != undefined && campaign.endDate != undefined) {
                        durationQuery = 'start_date=' + campaign.startDate + '&end_date=' + campaign.endDate
                    } else {
                        var sd =  campaign.startDate;
                        var ed =  campaign.endDate;

                        // var sd = dataTransferService.getClickedCampaignStartDate() ? dataTransferService.getClickedCampaignStartDate() : campaign.startDate;
                        //var ed = dataTransferService.getClickedCampaignEndDate() ? dataTransferService.getClickedCampaignEndDate() : campaign.endDate;
                        durationQuery = 'start_date=' +sd  + '&end_date=' + ed;
                    }
                }
                if (type == 'campaigns') {
                    urlPath =  api + '/campaigns/' + campaignId + '/bydays/perf?'+durationQuery
                } else if (type == 'strategies') {
                    urlPath =  api + '/campaigns/' + campaignId + (strategyId ? ('/strategies/' + strategyId) : '') + '/bydays/perf?'+durationQuery;
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
                return this.fetch(url);
            },

            getCostFormatsData: function(campaign,  timePeriod) {
                // for testing
                //var url = apiPaths.apiSerivicesUrl + '/campaigns/401652/byformats/perf?date_filter=life_time'
                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + campaign.orderId + '/byformats/perf?date_filter=' + timePeriod;
                return this.fetch(url);
            },
            getScreenData: function(campaign) {
                // for testing
                //var url = apiPaths.apiSerivicesUrl + '/campaigns/401652/byformats/perf?date_filter=life_time'
                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + campaign.orderId + '/byscreens/perf?start_date=' +campaign.startDate + '&end_date=' +campaign.endDate;
                return this.fetch(url);
            },

            getVideoViewabilityData: function(campaign) {
                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + campaign.orderId + '/viewReport';
                return this.fetch(url);
            },

            getActions: function () {
                var url = apiPaths.workflow_apiServicesUrl + '/actionTypes';
                return this.fetch(url);
            },

            getTactics: function (orderId) {
                //var url = campaign_api + '/orders/' + orderId + '/ads/ads.json';
                var url = apiPaths.apiSerivicesUrl + '/campaigns/' + orderId + '/strategies/tactics/meta';
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
                var url = apiPaths.workflow_apiServicesUrl + '/actions';
                analytics.track(loginModel.getUserRole(), constants.GA_CAMPAIGN_DETAILS_CREATE_ACTIVITY, 'number_of_action_subtypes_selected', loginModel.getLoginName(), data.action_sub_type_ids.length);
                analytics.track(loginModel.getUserRole(), constants.GA_CAMPAIGN_DETAILS_CREATE_ACTIVITY, 'number_of_tactics_selected', loginModel.getLoginName(), data.action_tactic_ids.length);
                analytics.track(loginModel.getUserRole(), constants.GA_CAMPAIGN_DETAILS_CREATE_ACTIVITY, (data.make_external ? 'external' : 'internal'), loginModel.getLoginName());
                return this.post(url, data, {'Content-Type': 'application/json'});
            },

            updateLastViewedAction: function(campaignId) {
                return this.put(urlService.APIlastViewedAction(campaignId), {}).then(function(response) {
                    if(response.status === "success") {
                        //delete default campaign list cache here
                        dataStore.deleteAllCachedCampaignListUrls();
                    }
                })
            },

            append: function(url,paramsObj){
                for(var property in paramsObj){
                    if(paramsObj.hasOwnProperty(property)&&paramsObj[property]!==''){
                        url += '&'+property+"="+paramsObj[property];
                    }
                }
                return url;
            },

            fetch: function (url) {
                loginModel.checkCookieExpiry();
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
                return $http({url: url, method: 'GET'}).then(
                    function (response) {
                        var urlIndex = utils.getParameterByName(url, 'urlIndex');
                        var objOnSuccess = {
                            status: "success",
                            data: response.data
                        };
                        if(urlIndex) {
                            objOnSuccess['urlIndex'] = Number(urlIndex[1]);
                        }

                        if(response.status === 401) {
                            loginModel.unauthorized();
                            return errorObject;
                        } else if(response.status === 403) {
                            loginModel.forbidden();
                            return errorObject;
                        } else if(response.status === 204) {
                            objOnSuccess.status=constants.DATA_NOT_AVAILABLE;
                        }
                        dataStore.cacheByUrl(url, objOnSuccess)
                        return utils.clone(objOnSuccess);
                    },
                    function (error) {
                        if(error.status !== 0) {
                            if(error.status == 401) {
                                loginModel.unauthorized();
                                return errorObject;
                            } else if(error.status === 403) {
                                loginModel.forbidden();
                                return errorObject;
                            }
                            return {
                                status: "error",
                                data: error
                            };
                        }
                    }
                );
            },

            downloadFile: function (url) {
                $http.defaults.headers.common['Authorization'] = loginModel.getAuthToken();
                return $http({url: url, method: 'GET', responseType: 'arraybuffer'}).then(
                    function (response) {
                        if (response.status === 401) {
                            loginModel.unauthorized();
                            return errorObject;
                        } else if (response.status === 403) {
                            loginModel.forbidden();
                            return errorObject;
                        }
                        var objOnSuccess = {
                            status: "success",
                            data: response.data,
                            headers: response.headers,
                            fileName: response.headers('filename')
                        };
                        objOnSuccess.file = new Blob([objOnSuccess.data], {type: objOnSuccess.headers('Content-Type')});
                        return objOnSuccess;
                    },
                    function (error) {
                        if(error.status !== 0) {
                            if (error.status == 401) {
                                loginModel.unauthorized();
                                return errorObject;
                            } else if (error.status === 403) {
                                loginModel.forbidden();
                                return errorObject;
                            }
                            return {
                                status: "error",
                                data: error
                            };
                        }
                    }
                );
            },

            fetchCancelable: function (url, canceller, success, failure) {
                loginModel.checkCookieExpiry();
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

                        if(response.status === 401) {
                            loginModel.unauthorized();
                            return errorObject;
                        } else if(response.status === 403) {
                            loginModel.forbidden();
                            return errorObject;
                        } else if(response.status === 204) {
                            objOnSuccess.status=constants.DATA_NOT_AVAILABLE;
                        }
                        dataStore.cacheByUrl(url, objOnSuccess)
                        return success.call(this, utils.clone(objOnSuccess));
                    },
                    function (error) {
                        if(error.status !== 0) {
                            if (error.status === 401) {
                                loginModel.unauthorized();
                                return errorObject;
                            } else if (error.status === 403) {
                                loginModel.forbidden();
                                return errorObject;
                            }
                            var objOnError = {
                                status: "error",
                                data: error
                            }
                            if (failure != undefined) {
                                return failure.call(this, objOnError);
                            } else return objOnError
                        }
                    }
                );
            },

            post: function (url, data, header) {
                loginModel.checkCookieExpiry();
                $http.defaults.headers.common['Authorization'] = loginModel.getAuthToken();
                return $http({url: url, method: 'POST', cache: true, data: angular.toJson(data), headers: (header ? header : {'Content-Type': 'text/plain'}) }).then(
                    function (response) {
                        if(response.status === 401) {
                            loginModel.unauthorized();
                            return errorObject;
                        } else if(response.status === 403) {
                            loginModel.forbidden();
                            return errorObject;
                        }
                        return {
                            status: "success",
                            data: response.data
                        };
                    },
                    function (error) {
                        if(error.status === 401) {
                            errorObject.data.message = error.data.message
                            loginModel.unauthorized();
                            return errorObject;
                        } else if(error.status === 403) {
                            loginModel.forbidden();
                            return errorObject;
                        } else if(error.status === 404) {
                            errorObject.data.message = 'Network error.  Please contact support.'
                            return errorObject;
                        }
                        return {
                            status: "error",
                            data: error
                        };
                    }
                );
            },

            put: function (url, data) {
                loginModel.checkCookieExpiry();
                $http.defaults.headers.common['Authorization'] = loginModel.getAuthToken();
                return $http.put(url, angular.toJson(data)).then(
                    function (response) {
                        if(response.status == 401) {
                            loginModel.unauthorized();
                            return errorObject;
                        } else if(response.status === 403) {
                            loginModel.forbidden();
                            return errorObject;
                        }
                        return {
                            status: "success",
                            data: response.data
                        };
                    },
                    function (error) {
                        if(error.status == 401) {
                            loginModel.unauthorized();
                            return errorObject;
                        } else if(error.status === 403) {
                            loginModel.forbidden();
                            return errorObject;
                        }
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
