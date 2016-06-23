/**
 * Created by collective on 07/08/15.
 */

define(['angularAMD', 'common/services/url_service', 'common/services/data_service',
    'reporting/advertiser/advertiser_model', 'reporting/brands/brands_model', 'common/services/data_store_model'],
    function (angularAMD) {
        angularAMD.factory('collectiveReportModel', ['urlService', 'dataService', 'advertiserModel', 'brandsModel',
            'dataStore', function (urlService, dataService, advertiserModel, brandsModel,dataStore) {
                var reportList = {},

                    // get uploaded report
                    getReportList = function (clientId, advertiserId, brandId, campaignId) {
                        // var selectedCampaginObj = JSON.parse(localStorage.getItem('selectedCampaignAll')),
                        //     selectedCampagin = JSON.parse(localStorage.getItem('selectedCampaignAll')),
                        //     advertiserId = advertiserModel.getSelectedAdvertiser().id,
                        //     brandId = brandsModel.getSelectedBrand().id,
                        var url = urlService.APIReportList(clientId, advertiserId, brandId, campaignId);
                        console.log('getReportList', 'fetching the url', url);
                        return dataService.getReportListData(url)

                        // return dataService
                        //     .getReportListData(url)
                        //     .then(function (response) {
                        //         callback(response.data);
                        //         return response.data;
                        //     });
                    },

                    // delete uploaded report
                    deleteReport = function (clientId, reportId, callback) {
                        var url = urlService.APIDeleteReport(clientId, reportId);

                        return dataService
                            .delete(url)
                            .then(function (response) {
                                callback(response.data);
                                return response.data;
                            });
                    },

                    // custom report methods starts here
                    deleteSavedReport = function (successFn, errorFn, clientId, reportId) {
                        var url = urlService.deleteSavedRpt(clientId, reportId);

                        dataService
                            .delete(url)
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

                        queryStr && (url += queryStr);

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
                            .delete(url)
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
                            .delete(url)
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

                    createSchdReport = function (successCall, errorCall, clientId, data) {
                        var url = urlService.createScheduledRpt(clientId);

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

                    createSavedReport = function (successCall, errorCall, clientId, data) {
                        var url = urlService.createSavedRpt(clientId);

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

                    archiveSchdReport = function (successCall, errorCall, clientId, reportId, instanceId) {
                        var url = urlService.archiveSchldRpt(clientId, reportId, instanceId);

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
                    getReportList: getReportList,
                    deleteReport: deleteReport,
                    getScheduleReportList: getScheduleReportList,
                    deleteScheduledReport:deleteScheduledReport,
                    deleteScheduledReportInstance: deleteScheduledReportInstance,
                    getSchdRptDetail:getSchdRptDetail,
                    createSchdReport:createSchdReport,
                    archiveSchdReport:archiveSchdReport,
                    getSaveRptDetail:getSaveRptDetail,
                    deleteSavedReport:deleteSavedReport,
                    createSavedReport:createSavedReport
                };
            }
        ]);
    }
);
