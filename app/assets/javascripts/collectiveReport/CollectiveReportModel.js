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
        dataService.post(url).then(function(response){ console.log(response);
           if(response.status == "error") {
                  errorFn(response);
           } else {
                  successFn(response.data.data);
           }
        })
    }

    return {
      reportList: getReportList,
      deleteReport: deleteReport,
      getScheduleReportList: getScheduleReportList
    }
}]);
