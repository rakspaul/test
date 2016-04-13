/**
 * Created by collective on 07/08/15.
 */

define(['angularAMD', 'common/services/url_service', 'common/services/data_service',
    'reporting/advertiser/advertiser_model', 'reporting/brands/brands_model', 'common/services/data_store_model'],
    function (angularAMD) {
        angularAMD.factory('collectiveReportModel', ['urlService', 'dataService', 'advertiserModel', 'brandsModel',
            'dataStore', function (urlService, dataService, advertiserModel, brandsModel,dataStore) {
                var reportList = {},

                    getReportList = function (callback) {
                        var selectedCampaginObj = JSON.parse(localStorage.getItem('selectedCampaignAll')),
                            selectedCampagin = JSON.parse(localStorage.getItem('selectedCampaignAll')),
                            advertiserId = advertiserModel.getSelectedAdvertiser().id,
                            brandId = brandsModel.getSelectedBrand().id,
                            url = urlService.APIReportList(advertiserId, brandId, selectedCampagin ?
                                selectedCampagin.id : -1);

                        return dataService
                            .getReportListData(url)
                            .then(function (response) {
                                callback(response.data);
                                return response.data;
                            });
                    },

                    deleteReport = function (fileId, callback) {
                        var url = urlService.APIDeleteReport(fileId);

                        return dataService
                            .delete(url)
                            .then(function (response) {
                                callback(response.data);
                                return response.data;
                            });
                    },

                    deleteSavedReport = function (successFn, errorFn, reportId) {
                        var url = urlService.deleteSavedRpt(reportId);

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

                    getScheduleReportList = function (successFn, errorFn, queryStr) {
                        var url = urlService.scheduleReportsList();

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

                    getSaveRptDetail = function (successCall, errorCall, reportId) {
                        var url = urlService.savedReport(reportId);

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

                    deleteScheduledReport = function (successFn, errorFn, reportId) {
                        var url = urlService.deleteSchdRpt(reportId);

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

                    deleteScheduledReportInstance = function (successFn, errorFn, reportId, instanceId) {
                        var url = urlService.deleteInstanceOfSchdRpt(reportId, instanceId);

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

                    getSchdRptDetail = function (successCall, errorCall, reportId) {
                        var url = urlService.scheduledReport(reportId);

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
                        var url = urlService.createSaveRpt();

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

                    archiveSchdReport = function (successCall,errorCall,reportId,instanceId) {
                        var url = urlService.archiveSchldRpt(reportId,instanceId);

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
