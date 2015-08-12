/**
 * Created by collective on 07/08/15.
 */

collectiveReportModule.factory("collectiveReportModel", ['urlService','dataService', function (urlService,dataService) {

    var reportList = {};
    var getReportList = function(callback) {
        var url = urlService.APIReportList(415486);
        console.log("url",url);
        return dataService.getReportListData(url).then(function(response) {
            console.log("Response: ",response.data);
            callback(response.data);
            return response.data;

        });
    };

    var deleteReport = function(fileId, callback) {
        var url = urlService.APIDeleteReport(fileId);
        console.log("url",url);
        return dataService.delete(url).then(function(response) {
            callback(response.data);
            return response.data;

        });
    }







    return {
      reportList: getReportList,
      deleteReport: deleteReport
    }
}]);
