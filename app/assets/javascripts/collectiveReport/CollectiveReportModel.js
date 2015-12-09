/**
 * Created by collective on 07/08/15.
 */

collectiveReportModule.factory("collectiveReportModel", ['urlService','dataService','brandsModel','dataStore', function (urlService,dataService,brandsModel,dataStore) {

    var reportList = {};
    var getReportList = function(callback) {
        var selectedCampaginObj = JSON.parse(localStorage.getItem('selectedCampaignAll'));
        var brandId = brandsModel.getSelectedBrand().id;
        if(brandId == -1) {
            brandId = 0;
        }
        var url = urlService.APIReportList(brandId,selectedCampaginObj.id);
        return dataService.getReportListData(url).then(function(response) {
            callback(response.data);
            return response.data;
        });
    };

    var deleteReport = function(fileId, callback) {
        var url = urlService.APIDeleteReport(fileId);
        return dataService.delete(url).then(function(response) {
            callback(response.data);
            return response.data;
        });
    }

    var getScheduleReportList = function(successFn,errorFn) {
        var url = urlService.scheduleReportsList();
        if(url) {
            dataStore.deleteFromCache(url);
        }
        url = urlService.scheduleReportsList();
        dataService.fetch(url).then(function(response){
           if(response.status == "error") {
                  errorFn(response);
           } else {
                  successFn(response.data.data);
           }
        })
    }

    var deleteScheduledReport = function(successFn,errorFn,reportId) {
        var url = urlService.deleteSchdRpt(reportId);
        dataService.delete(url).then(function(response){
            if(response.status == "success") {
                successFn(response.data);
            } else {
                errorFn(response.data);
            }
        })
    }

    var deleteScheduledReportInstance = function(successFn,errorFn,reportId,instanceId) {
        var url = urlService.deleteInstanceOfSchdRpt(reportId,instanceId);
        dataService.delete(url).then(function(response){
            if(response.status == "success") {
                successFn(response.data);
            } else {
                errorFn(response.data);
            }
        })
    }

    var getSchdRptDetail = function(successCall,errorCall,reportId) {
        var url = urlService.scheduledReport(reportId);
        dataService.fetch(url).then(function(response){
            if(response.status == "error") {
                errorCall(response);
            } else {
                successCall(response.data.data);
            }
        })
    }

    var createSchdReport = function(successCall, errorCall,data) {
        var url = urlService.createScheduledRpt();
        dataService.post(url, data, {'Content-Type': 'application/json'}).then(function(response) {
            if(response.status == "success") {
                successCall();
            } else {
                errorCall();
            }
        });
    }

    var archiveSchdReport = function(successCall,errorCall,reportId,instanceId) {
        var url = urlService.archiveSchldRpt(reportId,instanceId);
        dataService.put(url).then(function(response) {
            if(response.status == "success") {
                successCall();
            } else {
                errorCall();
            }
        });
    }

    return {
      reportList: getReportList,
      deleteReport: deleteReport,
      getScheduleReportList: getScheduleReportList,
      deleteScheduledReport:deleteScheduledReport,
      deleteScheduledReportInstance: deleteScheduledReportInstance,
      getSchdRptDetail:getSchdRptDetail,
      createSchdReport:createSchdReport,
      archiveSchdReport:archiveSchdReport
    }
}]);
