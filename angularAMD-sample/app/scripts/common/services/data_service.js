define(['angularAMD','common/services/vistoconfig_service', 'common/services/data_store_model','common/utils','common/services/url_service','login/login_model','common/services/constants_service','common/services/analytics_service'], function (angularAMD) {
    angularAMD.factory("dataService", function ($q, $http, $cookieStore, $location, vistoconfig, dataStore, utils, urlService, loginModel, constants) {
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
                return this.fetch(vistoconfig.apiPaths.apiSerivicesUrl_NEW + urlPath)
            },

            getCdbChartData: function (campaign, timePeriod, type, strategyId) {
                var urlPath;
                var clientId = loginModel.getSelectedClient().id;
                var campaignId= campaign.orderId ;// dataTransferService.getClickedCampaignId();
                var  durationQuery= 'date_filter=' + timePeriod;
                if(timePeriod === 'life_time') {
                    if(campaign.startDate != undefined && campaign.endDate != undefined) {
                        durationQuery = 'start_date=' + campaign.startDate + '&end_date=' + campaign.endDate
                    } else {
                        var sd =  campaign.startDate;
                        var ed =  campaign.endDate;
                        durationQuery = 'start_date=' +sd  + '&end_date=' + ed;
                    }
                }
                if (type == 'campaigns') {
                    urlPath =  vistoconfig.apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + '/campaigns/' + campaignId + '/bydays/perf?'+durationQuery;
                } else if (type == 'strategies') {
                    urlPath =  vistoconfig.apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + '/campaigns/' + campaignId + '/strategies/' + strategyId + '/bydays/perf?'+durationQuery;
                }
                return this.fetch(urlPath);
            },

            getCdbTacticsMetrics: function(campaignId, filterStartDate, filterEndDate) {
                var clientId = loginModel.getSelectedClient().id;
                var url = vistoconfig.apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + '/campaigns/' + campaignId + '/strategies/tactics?start_date=' + filterStartDate + '&end_date=' + filterEndDate;
                return this.fetch(url);
            },

            getCdbTacticsChartData: function(campaignId, strategyId, tacticsId, timePeriod, filterStartDate, filterEndDate) {
                var clientId = loginModel.getSelectedClient().id;
                var url = vistoconfig.apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + '/campaigns/' + campaignId + '/strategies/' + strategyId + '/tactics/' + tacticsId + '/bydays/perf?start_date=' + filterStartDate + '&end_date=' + filterEndDate;
                return this.fetch(url);
            },

            getStrategyTacticList: function(adGroupId) {
                var clientId = loginModel.getSelectedClient().id;
                var url = vistoconfig.apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + '/ad_groups/' + adGroupId + '/ads';
                return this.fetch(url);
            },

            getUnassignedTacticList: function(campaignId) {
                var clientId = loginModel.getSelectedClient().id;
                var url = vistoconfig.apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + '/campaigns/' + campaignId + '/no_ad_group/ads';
                return this.fetch(url);
            },

            getCostViewability: function(campaign, timePeriod) {
                var clientId = loginModel.getSelectedClient().id;
                var url = vistoconfig.apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + '/campaigns/' + campaign.orderId + '/viewReport?date_filter=' + timePeriod;
                return this.fetch(url);
            },

            getCustomReportMetrics :  function(campaign) {
                var clientId = loginModel.getSelectedClient().id;
                var url = vistoconfig.apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + '/reports/custom/meta';
                return this.fetch(url);
            },

            getCustomReportData: function(campaign, queryString) {
                var clientId = loginModel.getSelectedClient().id;
                var url = vistoconfig.apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + '/custom_reports/' + queryString;
                return this.fetch(url);
            },

            getVideoViewabilityData: function(campaign) {
                var clientId = loginModel.getSelectedClient().id;
                var url = vistoconfig.apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + '/campaigns/' + campaign.orderId + '/viewReport';
                return this.fetch(url);
            },

            getActions: function () {
                var clientId = loginModel.getSelectedClient().id;
                var url = vistoconfig.apiPaths.workflow_apiServicesUrl + '/clients/' + clientId + '/actionTypes';
                return this.fetch(url);
            },

            getTactics: function (orderId) {
                var clientId = loginModel.getSelectedClient().id;
                var url = vistoconfig.apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + '/campaigns/' + orderId + '/ads/meta';
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

            getReportListData: function (url) {
                return this.fetch(url);
            },

            createAction: function (data) {
                var clientId = loginModel.getSelectedClient().id;
                var url = vistoconfig.apiPaths.workflow_apiServicesUrl + '/clients/' + clientId + '/actions';
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

            createScheduleReport :  function(data) {
                return this.post( urlService.createScheduledRpt(), data, {'Content-Type': 'application/json'})
            },

            updateScheduleReport: function(reportId,data) {
                var url = urlService.updateScheduledRpt(reportId);
                return this.put(url,data);
            },

            append: function(url,paramsObj){
                for(var property in paramsObj){
                    if(paramsObj.hasOwnProperty(property)&&paramsObj[property]!==''){
                        url += '&'+property+"="+paramsObj[property];
                    }
                }
                return url;
            },

            fetch: function (url, cacheObj) {
                cacheObj = _.extend({cache:true}, cacheObj);
                loginModel.checkCookieExpiry();
//                if(cacheObj.cache) {
//                    var cachedResponse = dataStore.getCachedByUrl(url);
//                    if (cachedResponse != undefined) {
//                        var defer = $q.defer();
//                        var promise = defer.promise.then(function () {
//                            //here we always return a clone of original object, so that if any modifications are done it will be done on clone and original will remain unchanged
//                            return utils.clone(cachedResponse.value);
//                        });
//                        defer.resolve();
//                        return promise;
//                    }
//                }
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
//                if(cachedResponse != undefined) {
//                    var defer = $q.defer();
//                    var promise = defer.promise.then(function () {
//                        return success.call(this, utils.clone(cachedResponse.value));
//                    });
//                    defer.resolve();
//                    return promise;
//                }
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
            },

            delete: function (url, data, header) {
                loginModel.checkCookieExpiry();
                $http.defaults.headers.common['Authorization'] = loginModel.getAuthToken();
                  return $http({url: url, method: 'DELETE', cache: true, data: angular.toJson(data), headers: (header ? header : {'Content-Type': 'text/plain'}) }).then(
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
            }
        };
    });
});
