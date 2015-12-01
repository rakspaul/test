/**
 * Created by collective on 07/08/15.
 */

collectiveReportModule.factory("collectiveReportModel", ['urlService','dataService','brandsModel', function (urlService,dataService,brandsModel) {

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
        dataService.fetch(url).then(function(response){ console.log(response);
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
               console.log('Delete response',response);
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
            console.log('Delete response',response);
            if(response.status == "success") {
                successFn(response.data);
            } else {
                errorFn(response.data);
            }
        })
    }

    return {
      reportList: getReportList,
      deleteReport: deleteReport,
      getScheduleReportList: getScheduleReportList,
        deleteScheduledReport:deleteScheduledReport,
        deleteScheduledReportInstance: deleteScheduledReportInstance
    }
}]);
