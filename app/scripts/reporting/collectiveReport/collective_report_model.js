/**
 * Created by collective on 07/08/15.
 */

define(['angularAMD', 'common/services/url_service', 'common/services/data_service',
    'reporting/advertiser/advertiser_model', 'reporting/brands/brands_model', 'common/services/data_store_model'],
    function (angularAMD) {
        'use strict';

        angularAMD.factory('collectiveReportModel', ['urlService', 'dataService', 'advertiserModel', 'brandsModel',
            'dataStore', function (urlService, dataService, advertiserModel, brandsModel,dataStore) {

                var getReportList = function (clientId, advertiserId, brandId, campaignId) {
                    var url = urlService.APIReportList(clientId, advertiserId, brandId, campaignId);
                        return dataService.getReportListData(url);
                        },

                        // delete uploaded report
                        deleteReport = function (clientId, reportId, callback) {
                            var url = urlService.APIDeleteReport(clientId, reportId);

                            return dataService
                                .deleteRequest(url)
                                .then(function (response) {
                                    callback(response.data);
                                    return response.data;
                                });
                        },

                        // custom report methods starts here
                        deleteSavedReport = function (successFn, errorFn, clientId, reportId) {
                            var url = urlService.deleteSavedRpt(clientId, reportId);

                            dataService
                                .deleteRequest(url)
                                .then(function (response){
                                    if (response.status === 'success') {
                                        successFn(response.data);
                                    } else {
                                        errorFn(response.data);
                                    }
                                });
                        },

                        getScheduleReportList = function (successFn, errorFn, clientId, queryStr) {
                            var url = urlService.scheduleReportsList(clientId);

                            if (url) {
                                dataStore.deleteFromCache(url);
                            }

                            if (queryStr){
                                url += queryStr;
                            }

                            dataService
                                .fetch(url)
                                .then(function (response){
                                    if (response.status === 'error') {
                                        errorFn(response);
                                    } else {
                                        successFn(response.data.data);
                                    }
                                });
                        },

                        getSaveRptDetail = function (successCall, errorCall, clientId, reportId) {
                            var url = urlService.savedReport(clientId, reportId);

                            dataService
                                .fetch(url)
                                .then(function (response){
                                    if (response.status === 'error') {
                                        errorCall(response);
                                    } else {
                                        successCall(response.data.data);
                                    }
                                });
                        },

                        deleteScheduledReport = function (successFn, errorFn, clientId, reportId) {
                            var url = urlService.deleteSchdRpt(clientId, reportId);

                            dataService
                                .deleteRequest(url)
                                .then(function (response){
                                    if (response.status === 'success') {
                                        successFn(response.data);
                                    } else {
                                        errorFn(response.data);
                                    }
                                });
                        },

                        deleteScheduledReportInstance = function (successFn, errorFn, clientId, reportId, instanceId) {
                            var url = urlService.deleteInstanceOfSchdRpt(clientId, reportId, instanceId);

                            dataService
                                .deleteRequest(url)
                                .then(function (response){
                                    if (response.status === 'success') {
                                        successFn(response.data);
                                    } else {
                                        errorFn(response.data);
                                    }
                                });
                        },

                        getSchdRptDetail = function (successCall, errorCall, clientId, reportId) {
                            var url = urlService.scheduledReport(clientId, reportId);

                            dataService
                                .fetch(url)
                                .then(function (response){
                                    if (response.status === 'error') {
                                        errorCall(response);
                                    } else {
                                        successCall(response.data.data);
                                    }
                                });
                        },

                        createSchdReport = function (successCall, errorCall, data) {
                            var url = urlService.createScheduledRpt();

                            dataService
                                .post(url, data, {'Content-Type': 'application/json'})
                                .then(function (response) {
                                    if (response.status === 'success') {
                                        successCall();
                                    } else {
                                        errorCall();
                                    }
                                });
                        },

                        createSavedReport = function (successCall, errorCall, data) {
                            var url = urlService.createSaveRpt(data.client_id);

                            dataService
                                .post(url, data, {'Content-Type': 'application/json'})
                                .then(function (response) {
                                    if (response.status === 'success') {
                                        successCall();
                                    } else {
                                        errorCall();
                                    }
                                });
                        },

                        archiveSchdReport = function (successCall,errorCall,clientId, reportId,instanceId) {
                            var url = urlService.archiveSchldRpt(clientId, reportId,instanceId);

                            dataService
                                .put(url)
                                .then(function (response) {
                                    if (response.status === 'success') {
                                        successCall();
                                    } else {
                                        errorCall();
                                    }
                                });
                        };

                return {
                    reportList: getReportList,
                    deleteReport: deleteReport,
                    getScheduleReportList: getScheduleReportList,
                    deleteScheduledReport: deleteScheduledReport,
                    deleteScheduledReportInstance: deleteScheduledReportInstance,
                    getSchdRptDetail: getSchdRptDetail,
                    createSchdReport: createSchdReport,
                    archiveSchdReport: archiveSchdReport,
                    getSaveRptDetail: getSaveRptDetail,
                    deleteSavedReport: deleteSavedReport,
                    createSavedReport: createSavedReport
                };
            }
        ]);
    }
);
