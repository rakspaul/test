define(['angularAMD', 'data-store-model', 'common-utils', 'url-service'],
    function (angularAMD) {
        angularAMD.factory('dataService', ['$q', '$http', '$location', '$routeParams', 'vistoconfig', 'dataStore', 'utils', 'urlService', 'loginModel',
            'constants', function ($q, $http, $location, $routeParams, vistoconfig, dataStore, utils, urlService, loginModel, constants) {
                var errorObject = {
                        status: 'error',
                        data: {message: 'Error'}
                    },

                    updateRequestHeader =  function () {
                        $http.defaults.headers.common.Authorization = loginModel.getAuthToken();
                    },

                    getSingleCampaign =  function (urlPath) {
                        return this.fetch(urlPath);
                    },

                    getActionItems =  function (urlPath) {
                        return this.fetch(urlPath);
                    },

                    getCampaignStrategies =  function (urlPath) {
                        return this.fetch(vistoconfig.apiPaths.apiSerivicesUrl_NEW + urlPath);
                    },

                    getCdbChartData = function (clientId, campaign, timePeriod, type, strategyId, realTime) {
                        var urlPath,
                            campaignId= campaign.orderId,
                            durationQuery= 'date_filter=' + timePeriod,
                            sd,
                            ed;

                        if (timePeriod === 'life_time') {
                            if (campaign.startDate !== undefined && campaign.endDate !== undefined) {
                                durationQuery = 'start_date=' + campaign.startDate + '&end_date=' + campaign.endDate;
                            } else {
                                sd =  campaign.startDate;
                                ed =  campaign.endDate;
                                durationQuery = 'start_date=' +sd  + '&end_date=' + ed;
                            }
                        }

                        if (type === 'campaigns') {
                            urlPath =  vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                                '/clients/' + clientId +
                                '/campaigns/' + campaignId +
                                '/bydays/perf?' + durationQuery;
                        } else if (type === 'strategies') {
                            urlPath =  vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                                '/clients/' + clientId +
                                '/campaigns/' + campaignId +
                                '/strategies/' + strategyId +
                                '/bydays/perf?' + durationQuery;
                        } else if (type === 'lineitems') {
                            urlPath =  vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                                '/clients/' + clientId +
                                '/campaigns/' + campaignId +
                                '/lineitems/' + strategyId +
                                '/bydays/perf?' + durationQuery;
                        }

                        if($location.path().endsWith('/mediaplans')){
                            urlPath += '&source=' + (realTime ? 'tracker' : 'sor');
                        }

                        return this.fetch(urlPath);
                    },

                    getCdbTacticsChartData = function (clientId, campaignId, strategyId, adId, timePeriod, filterStartDate, filterEndDate) {
                        var url = vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                            '/clients/' + clientId +
                            '/campaigns/' + campaignId +
                            '/lineitems/' + strategyId +
                            '/ads/' + adId +
                            '/bydays/perf?start_date=' + filterStartDate +
                            '&end_date=' + filterEndDate;

                        return this.fetch(url);
                    },

                    getStrategyTacticList =  function (clientId, campaignId, adGroupId) {
                        var url = vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                            '/clients/' + clientId +
                            '/campaigns/' + campaignId +
                            '/lineitems/' + adGroupId +
                            '/ads';

                        return this.fetch(url);
                    },

                    getUnassignedTacticList =  function (clientId, campaignId) {
                        var url = vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                            '/clients/' + clientId +
                            '/campaigns/' + campaignId +
                            '/no_ad_group/ads';

                        return this.fetch(url);
                    },

                    getCostViewability = function (clientId, campaign, timePeriod) {
                        var url = vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                            '/clients/' + clientId +
                            '/campaigns/' + campaign.orderId +
                            '/viewReport?date_filter=' + timePeriod;

                        return this.fetch(url);
                    },

                    getCustomReportMetrics  =  function (clientId) {
                        var url = vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                            '/clients/' + clientId +
                            '/reports/custom/meta';

                        return this.fetch(url);
                    },

                    getCustomReportData = function (clientId, reportId, queryString) {
                        var url = vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                            '/clients/' + clientId + '/custom_reports/' + reportId;

                        return this.post( url, queryString,undefined,false);
                    },

                    getVideoViewabilityData = function (clientId, campaign) {
                        var url = vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                            '/clients/' + clientId +
                            '/campaigns/' + campaign.orderId +
                            '/viewReport';

                        return this.fetch(url);
                    },

                    getActions = function (clientId) {
                        var url = vistoconfig.apiPaths.workflow_apiServicesUrl +
                            '/clients/' + clientId +
                            '/actionTypes';

                        return this.fetch(url);
                    },

                    getTactics = function (clientId, orderId) {
                        var url = vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                            '/clients/' + clientId +
                            '/campaigns/' + orderId +
                            '/ads/meta';

                        return this.fetch(url);
                    },

                    getCampaignData = function (periodKey, campaign, periodStartDate, periodEndDate) {
                        var qs,
                            url;

                        if (periodKey === 'life_time') {
                            qs = '?start_date=' + campaign.startDate + '&end_date=' + campaign.endDate;
                        } else {
                            qs = '?start_date='+periodStartDate+'&end_date='+periodEndDate;
                        }

                        // TODO: What is this *api* global variable doing here???
                        url = api + '/campaigns/' + campaign.orderId + '/perf' + qs; // jshint ignore:line

                        return this.fetch(url);
                    },

                    getReportListData = function (url) {
                        return this.fetch(url);
                    },

                    createAction = function (clientId, data) {
                        var url = vistoconfig.apiPaths.workflow_apiServicesUrl +
                            '/clients/' + clientId +
                            '/actions';

                        return this.post(url, data, {'Content-Type': 'application/json'});
                    },

                    createScheduleReport  =  function (clientId,data) {
                        return this.post( urlService.createScheduledRpt(clientId), data, {'Content-Type': 'application/json'});
                    },

                    createSaveReport =  function (clientId, data) {
                        return this.post( urlService.createSaveRpt(clientId), data, {'Content-Type': 'application/json'});
                    },

                    updateScheduleReport = function (clientId,reportId,data) {
                        var url = urlService.updateScheduledRpt(clientId,reportId);

                        return this.put(url,data);
                    },

                    updateSavedReport = function (clientId,reportId, data) {
                        var url = urlService.updateSavedRpt(clientId,reportId);

                        return this.put(url,data);
                    },

                    append = function (url, paramsObj) {
                        var property;
console.log('dataService.append(), url = ', url, ', paramsObj = ', paramsObj);

                        for (property in paramsObj) {
                            if (paramsObj.hasOwnProperty(property)&&paramsObj[property] !== '') {
                                url += '&' + property + '=' + paramsObj[property];
                            }
                        }

                        return url;
                    },

                    fetch = function (url, cacheObj) {
                        cacheObj = _.extend({cache:false}, cacheObj);
                        loginModel.checkCookieExpiry();
console.log('dataService.fetch(), url = ', url, ', cacheObj = ', cacheObj);
                        return $http({
                            url: url,
                            method: 'GET',
                            cache: cacheObj.cache
                        })
                            .then(function (response) {
                                var urlIndex = utils.getParameterByName(url, 'urlIndex'),

                                    objOnSuccess = {
                                        status: 'success',
                                        data: response.data
                                    };

                                if (urlIndex) {
                                    objOnSuccess.urlIndex = Number(urlIndex[1]);
                                }

                                if (response.status === 401) {
                                    loginModel.unauthorized();

                                    return errorObject;
                                } else if (response.status === 403) {
                                    loginModel.forbidden();

                                    return errorObject;
                                } else if (response.status === 204) {
                                    objOnSuccess.status = constants.DATA_NOT_AVAILABLE;
                                }

                                dataStore.cacheByUrl(url, objOnSuccess);

                                return utils.clone(objOnSuccess);
                            }, function (error) {
                                if (error.status !== 0) {
                                    if (error.status === 401) {
                                        loginModel.unauthorized();

                                        return errorObject;
                                    } else if (error.status === 403) {
                                        loginModel.forbidden();

                                        return errorObject;
                                    }

                                    return {
                                        status: 'error',
                                        data: error
                                    };
                                }
                            });
                    },

                    downloadFile = function (url, httpMethod, data, headers) {
                        $http.defaults.headers.common.Authorization = loginModel.getAuthToken();

                        httpMethod = httpMethod ? httpMethod : 'GET';
                        data = data ? data : '';
                        headers = headers ? headers: {'Content-Type': 'application/json'};

                        return $http({
                            url: url,
                            method: httpMethod,
                            data: data,
                            responseType: 'arraybuffer',
                            headers: headers
                        })
                            .then(function (response) {
                                var objOnSuccess = {
                                    status: 'success',
                                    data: response.data,
                                    headers: response.headers,
                                    fileName: response.headers('filename')
                                };

                                if (response.status === 401) {
                                    loginModel.unauthorized();
                                    return errorObject;
                                } else if (response.status === 403) {
                                    loginModel.forbidden();
                                    return errorObject;
                                }

                                objOnSuccess.file =
                                    new Blob([objOnSuccess.data], {type: objOnSuccess.headers('Content-Type')});

                                return objOnSuccess;
                            }, function (error) {
                                if (error.status !== 0) {
                                    if (error.status === 401) {
                                        loginModel.unauthorized();
                                        return errorObject;
                                    } else if (error.status === 403) {
                                        loginModel.forbidden();
                                        return errorObject;
                                    }

                                    return {
                                        status: 'error',
                                        data: error
                                    };
                                }
                            });
                    },

                    fetchCancelable = function (url, canceller, success, failure) {
                        loginModel.checkCookieExpiry();

                        return $http
                            .get(url, {timeout: canceller.promise})
                            .then(function (response) {
                                var objOnSuccess = {
                                    status: 'success',
                                    data: response.data
                                };

                                if (response.status === 401) {
                                    loginModel.unauthorized();
                                    return errorObject;
                                } else if (response.status === 403) {
                                    loginModel.forbidden();
                                    return errorObject;
                                } else if (response.status === 204) {
                                    objOnSuccess.status=constants.DATA_NOT_AVAILABLE;
                                }

                                dataStore.cacheByUrl(url, objOnSuccess);

                                return success.call(this, utils.clone(objOnSuccess));
                            }, function (error) {
                                if (error.status !== 0) {
                                    var objOnError = {
                                        status: 'error',
                                        data: error
                                    };

                                    if (error.status === 401) {
                                        loginModel.unauthorized();
                                        return errorObject;
                                    } else if (error.status === 403) {
                                        loginModel.forbidden();
                                        return errorObject;
                                    }

                                    if (failure !== undefined) {
                                        return failure.call(this, objOnError);
                                    } else {
                                        return objOnError;
                                    }
                                }
                            });
                    },

                    post = function (url, data, header,dataToJson) {
                        loginModel.checkCookieExpiry();
                        $http.defaults.headers.common.Authorization = loginModel.getAuthToken();

                        return $http({
                            url: url,
                            method: 'POST',
                            cache: true,
                            data: !dataToJson ? data : angular.toJson(data),
                            headers: (header ? header : {'Content-Type': 'text/plain'})
                        })
                            .then(function (response) {
                                if (response.status === 401) {
                                    loginModel.unauthorized();
                                    return errorObject;
                                } else if (response.status === 403) {
                                    loginModel.forbidden();
                                    return errorObject;
                                }

                                return {
                                    status: 'success',
                                    data: response.data
                                };
                            }, function (error) {
                                if (error.status === 401) {
                                    errorObject.data.message = error.data.message;
                                    loginModel.unauthorized();
                                    return errorObject;
                                } else if (error.status === 403) {
                                    loginModel.forbidden();
                                    return errorObject;
                                } else if (error.status === 404) {
                                    errorObject.data.message = 'Network error.  Please contact support.';
                                    return errorObject;
                                }

                                return {
                                    status: 'error',
                                    data: error
                                };
                            });
                    },

                    put = function (url, data) {
                        loginModel.checkCookieExpiry();
                        $http.defaults.headers.common.Authorization = loginModel.getAuthToken();

                        return $http
                            .put(url, angular.toJson(data))
                            .then(function (response) {
                                if (response.status === 401) {
                                    loginModel.unauthorized();
                                    return errorObject;
                                } else if (response.status === 403) {
                                    loginModel.forbidden();
                                    return errorObject;
                                }

                                return {
                                    status: 'success',
                                    data: response.data
                                };
                            }, function (error) {
                                if (error.status === 401) {
                                    loginModel.unauthorized();
                                    return errorObject;
                                } else if (error.status === 403) {
                                    loginModel.forbidden();
                                    return errorObject;
                                }

                                return {
                                    status: 'error',
                                    data: error
                                };
                            });
                    },

                    deleteRequest = function (url, data, header) {
                        loginModel.checkCookieExpiry();
                        $http.defaults.headers.common.Authorization = loginModel.getAuthToken();

                        return $http({
                            url: url,
                            method: 'DELETE',
                            cache: true,
                            data: angular.toJson(data),
                            headers: (header ? header : {'Content-Type': 'text/plain'})
                        })
                            .then(function (response) {
                                if (response.status === 401) {
                                    loginModel.unauthorized();
                                    return errorObject;
                                } else if (response.status === 403) {
                                    loginModel.forbidden();
                                    return errorObject;
                                }

                                return {
                                    status: 'success',
                                    data: response.data
                                };
                            }, function (error) {
                                if (error.status === 401) {
                                    errorObject.data.message = error.data.message;
                                    loginModel.unauthorized();
                                    return errorObject;
                                } else if (error.status === 403) {
                                    loginModel.forbidden();
                                    return errorObject;
                                } else if (error.status === 404) {
                                    errorObject.data.message = 'Network error.  Please contact support.';
                                    return errorObject;
                                }

                                return {
                                    status: 'error',
                                    data: error
                                };
                            });
                    };

                updateRequestHeader();

                return {
                    updateRequestHeader: updateRequestHeader,
                    getSingleCampaign: getSingleCampaign,
                    getActionItems: getActionItems,
                    getCampaignStrategies: getCampaignStrategies,
                    getCdbChartData: getCdbChartData,
                    getCdbTacticsChartData: getCdbTacticsChartData,
                    getStrategyTacticList: getStrategyTacticList,
                    getUnassignedTacticList: getUnassignedTacticList,
                    getCostViewability: getCostViewability,
                    getCustomReportMetrics: getCustomReportMetrics,
                    getCustomReportData: getCustomReportData,
                    getVideoViewabilityData: getVideoViewabilityData,
                    getActions: getActions,
                    getTactics: getTactics,
                    getCampaignData: getCampaignData,
                    getReportListData: getReportListData,
                    createAction: createAction,
                    createScheduleReport: createScheduleReport,
                    createSaveReport: createSaveReport,
                    updateScheduleReport: updateScheduleReport,
                    updateSavedReport: updateSavedReport,
                    append: append,
                    fetch: fetch,
                    downloadFile: downloadFile,
                    fetchCancelable: fetchCancelable,
                    post: post,
                    put: put,
                    deleteRequest: deleteRequest
                };
            }]);
    }
);
