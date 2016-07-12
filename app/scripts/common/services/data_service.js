define(['angularAMD', 'common/services/vistoconfig_service', 'common/services/data_store_model', // jshint ignore:line
    'common/utils', 'common/services/url_service', 'login/login_model', 'common/services/constants_service'],
    function (angularAMD) {
        angularAMD.factory('dataService', function ($q, $http, $cookieStore, $location, vistoconfig, dataStore, utils,
                                                    urlService, loginModel, constants) {
            var errorObject = {
                status: 'error',
                data: {message: 'Error'}
            };

            $http.defaults.headers.common.Authorization = loginModel.getauth_token();

            return {
                updateRequestHeader: function () {
                    $http.defaults.headers.common.Authorization = loginModel.getauth_token();
                },

                getSingleCampaign: function (urlPath) {
                    return this.fetch(urlPath);
                },

                getActionItems: function (urlPath) {
                    return this.fetch(urlPath);
                },

                getCampaignStrategies: function (urlPath) {
                    return this.fetch(vistoconfig.apiPaths.apiSerivicesUrl_NEW + urlPath);
                },

                getCdbChartData: function (campaign, timePeriod, type, strategyId) {
                    var urlPath,
                        clientId = loginModel.getSelectedClient().id,
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

                    return this.fetch(urlPath);
                },

                getCdbTacticsMetrics: function (campaignId, filterStartDate, filterEndDate) {
                    var clientId = loginModel.getSelectedClient().id,
                        url = vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                            '/clients/' + clientId +
                            '/campaigns/' + campaignId +
                            '/strategies/tactics?start_date=' + filterStartDate +
                            '&end_date=' + filterEndDate;

                    return this.fetch(url);
                },

                getCdbTacticsChartData: function (campaignId, strategyId, adId, timePeriod, filterStartDate,
                                                  filterEndDate) {
                    var clientId = loginModel.getSelectedClient().id,
                        url = vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                            '/clients/' + clientId +
                            '/campaigns/' + campaignId +
                            '/lineitems/' + strategyId +
                            '/ads/' + adId +
                            '/bydays/perf?start_date=' + filterStartDate +
                            '&end_date=' + filterEndDate;

                    return this.fetch(url);
                },

                getStrategyTacticList: function (adGroupId, campaignId) {
                    var clientId = loginModel.getSelectedClient().id,
                        url = vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                            '/clients/' + clientId +
                            '/campaigns/' + campaignId +
                            '/lineitems/' + adGroupId +
                            '/ads';

                    return this.fetch(url);
                },

                getUnassignedTacticList: function (campaignId) {
                    var clientId = loginModel.getSelectedClient().id,
                        url = vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                            '/clients/' + clientId +
                            '/campaigns/' + campaignId +
                            '/no_ad_group/ads';

                    return this.fetch(url);
                },

                getCostViewability: function (campaign, timePeriod) {
                    var clientId = loginModel.getSelectedClient().id,
                        url = vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                            '/clients/' + clientId +
                            '/campaigns/' + campaign.orderId +
                            '/viewReport?date_filter=' + timePeriod;

                    return this.fetch(url);
                },

                getCustomReportMetrics :  function () {
                    var clientId = loginModel.getMasterClient().id,
                        url = vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                            '/clients/' + clientId +
                            '/reports/custom/meta';

                    return this.fetch(url);
                },

                getCustomReportData: function (reportId, queryString) {
                    var clientId = loginModel.getMasterClient().id,
                        url = vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                            '/clients/' + clientId + '/custom_reports/' + reportId;

                    return this.post( url, queryString,undefined,false);
                },

                getVideoViewabilityData: function (campaign) {
                    var clientId = loginModel.getSelectedClient().id,
                        url = vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                            '/clients/' + clientId +
                            '/campaigns/' + campaign.orderId +
                            '/viewReport';

                    return this.fetch(url);
                },

                getActions: function () {
                    var clientId = loginModel.getSelectedClient().id,
                        url = vistoconfig.apiPaths.workflow_apiServicesUrl +
                            '/clients/' + clientId +
                            '/actionTypes';

                    return this.fetch(url);
                },

                getTactics: function (orderId) {
                    var clientId = loginModel.getSelectedClient().id,
                        url = vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                            '/clients/' + clientId +
                            '/campaigns/' + orderId +
                            '/ads/meta';

                    return this.fetch(url);
                },

                getCampaignData: function (periodKey, campaign, periodStartDate, periodEndDate) {
                    var qs,
                        url;

                    if (periodKey === 'life_time') {
                        qs = '?start_date=' + campaign.startDate + '&end_date=' + campaign.endDate;
                    } else {
                        qs = '?start_date='+periodStartDate+'&end_date='+periodEndDate;
                    }

                    url = api + '/campaigns/' + campaign.orderId + '/perf' + qs; // jshint ignore:line

                    return this.fetch(url);
                },

                getReportListData: function (url) {
                    return this.fetch(url);
                },

                createAction: function (data) {
                    var clientId = loginModel.getSelectedClient().id,
                        url = vistoconfig.apiPaths.workflow_apiServicesUrl +
                            '/clients/' + clientId +
                            '/actions';

                    return this.post(url, data, {'Content-Type': 'application/json'});
                },

                updateLastViewedAction: function (campaignId) {
                    return this
                        .put(urlService.APIlastViewedAction(campaignId), {})
                        .then(function (response) {
                            if (response.status === 'success') {
                                //delete default campaign list cache here
                                dataStore.deleteAllCachedCampaignListUrls();
                            }
                        });
                },

                createScheduleReport :  function (data) {
                    return this.post( urlService.createScheduledRpt(), data, {'Content-Type': 'application/json'});
                },


                createSaveReport :  function (data) {
                    return this.post( urlService.createSaveRpt(), data, {'Content-Type': 'application/json'});
                },

                updateScheduleReport: function (reportId,data) {
                    var url = urlService.updateScheduledRpt(reportId);

                    return this.put(url,data);
                },

                updateSavedReport: function (reportId, data) {
                    var url = urlService.updateSavedRpt(reportId);

                    return this.put(url,data);
                },

                append: function (url, paramsObj) {
                    var property;

                    for (property in paramsObj) {
                        if (paramsObj.hasOwnProperty(property)&&paramsObj[property] !== '') {
                            url += '&' + property + '=' + paramsObj[property];
                        }
                    }

                    return url;
                },

                fetch: function (url, cacheObj) {
                    cacheObj = _.extend({cache:false}, cacheObj); // jshint ignore:line
                    loginModel.checkCookieExpiry();

                    return $http({url: url, method: 'GET', cache: cacheObj.cache}).then(
                        function (response) {
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
                                objOnSuccess.status=constants.DATA_NOT_AVAILABLE;
                            }

                            dataStore.cacheByUrl(url, objOnSuccess);

                            return utils.clone(objOnSuccess);
                        },

                        function (error) {
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
                        }
                    );
                },

                downloadFile: function (url, httpMethod, data, headers) {
                    $http.defaults.headers.common.Authorization = loginModel.getauth_token();
                    httpMethod = httpMethod ? httpMethod : 'GET';
                    data = data ? data : '';
                    headers = headers ? headers: {'Content-Type': 'application/json'};

                    return $http({
                        url: url,
                        method: httpMethod,
                        data: data,
                        responseType: 'arraybuffer',
                        headers: headers
                    }).then(
                        function (response) {
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
                        },

                        function (error) {
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
                        }
                    );
                },

                fetchCancelable: function (url, canceller, success, failure) {
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
                        });
                },

                post: function (url, data, header,dataToJson) {
                    loginModel.checkCookieExpiry();
                    $http.defaults.headers.common.Authorization = loginModel.getauth_token();

                    return $http({
                        url: url,
                        method: 'POST',
                        cache: true,
                        data: !dataToJson ? data : angular.toJson(data), // jshint ignore:line
                        headers: (header ? header : {'Content-Type': 'text/plain'})
                    }).then(
                        function (response) {
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
                        }
                    );
                },

                put: function (url, data) {
                    loginModel.checkCookieExpiry();
                    $http.defaults.headers.common.Authorization = loginModel.getauth_token();

                    return $http
                        .put(url, angular.toJson(data)) // jshint ignore:line
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

                delete: function (url, data, header) {
                    loginModel.checkCookieExpiry();
                    $http.defaults.headers.common.Authorization = loginModel.getauth_token();

                    return $http({
                        url: url,
                        method: 'DELETE',
                        cache: true,
                        data: angular.toJson(data), // jshint ignore:line
                        headers: (header ? header : {'Content-Type': 'text/plain'})
                    }).then(function (response) {
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
                        }
                    );
                }
            };
        });
    }
);
