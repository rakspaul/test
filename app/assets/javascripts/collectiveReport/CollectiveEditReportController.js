/**
 * Created by Sapna kotresh on 06/08/15.
 */
(function() {
    'use strict';

    collectiveReportModule.controller('CollectiveEditReportController', function($scope, $modalInstance, report,campaignSelectModel,dataService,urlService) {
        $scope.report = report;
        $scope.close=function(){
            $modalInstance.dismiss();
        };

        //Need to move reportTypes
        $scope.reportTypes =[
            {id:'Custom',name:'Custom'},
            {id:'PCAR',name:'PCAR'}
        ];

        //campaignId = 415486
        $scope.editedData = {
            reportType:report.reportType,
            reportName: report.reportName,
            campaignId:report.campaignId,
            notes:report.notes
        }

        $scope.updateReport = function() {
            dataService.put(urlService.APIEditReport(report.id),$scope.editedData,{'Content-Type': 'multipart/form-data'}).then(function(response) {
                console.log("Edit Response: ",response);
            });
        }
    });
}());